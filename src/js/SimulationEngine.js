import { OptimalStrategy } from './OptimalStrategy.js'
import { SimulationStats } from './SimulationStats.js'
import { Deck } from './Card.js'

/**
 * High-performance simulation engine for video poker
 */
export class SimulationEngine {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.optimalStrategy = new OptimalStrategy()
    this.stats = new SimulationStats()
    this.isRunning = false
    this.timeoutId = null

    // Event listeners
    this.listeners = {
      progress: [],
      complete: [],
      error: [],
      handComplete: []
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  /**
   * Start simulation
   */
  async startSimulation(options = {}) {
    try {
      // Validate options
      const config = this.validateOptions(options)

      console.log('🎰 Starting simulation with config:', config)

      // Reset state
      this.isRunning = true
      this.stats.reset()
      this.stats.setTotalHands(config.totalHands)
      this.stats.startTiming()

      // Start simulation loop
      await this.runSimulationLoop(config)
    } catch (error) {
      this.emit('error', error.message)
      throw error
    }
  }

  /**
   * Stop simulation
   */
  stopSimulation() {
    console.log('🛑 Stopping simulation')
    this.isRunning = false

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    this.emit('complete', this.stats.getFinalResults())
  }

  /**
   * Validate simulation options
   */
  validateOptions(options) {
    const config = {
      totalHands: options.totalHands || 10000,
      speed: options.speed || 1,
      strategy: options.strategy || 'optimal',
      bet: options.bet || 5
    }

    if (config.totalHands < 100 || config.totalHands > 100000) {
      throw new Error('Total hands must be between 100 and 100,000')
    }

    if (config.speed < 1 || config.speed > 1000) {
      throw new Error('Speed must be between 1 and 1000 ms')
    }

    if (
      !['optimal', 'random', 'aces-high', 'aces-optimal'].includes(
        config.strategy
      )
    ) {
      throw new Error(
        'Strategy must be "optimal", "random", "aces-high", or "aces-optimal"'
      )
    }

    if (config.bet < 1 || config.bet > 5) {
      throw new Error('Bet must be between 1 and 5')
    }

    return config
  }

  /**
   * Run the main simulation loop
   */
  async runSimulationLoop(config) {
    const startTime = Date.now()

    while (this.isRunning && this.stats.handsPlayed < config.totalHands) {
      // Simulate one hand
      const handResult = this.simulateHand(config)

      // Update statistics
      this.stats.addHand(handResult)

      // Emit progress every 10 hands for performance
      if (
        this.stats.handsPlayed % 10 === 0 ||
        this.stats.handsPlayed === config.totalHands
      ) {
        this.emit('progress', {
          handsPlayed: this.stats.handsPlayed,
          totalHands: config.totalHands,
          progress: (this.stats.handsPlayed / config.totalHands) * 100,
          currentStats: this.stats.getCurrentStats(),
          latestHand: handResult
        })
      }

      // Emit individual hand completion
      this.emit('handComplete', handResult)

      // Yield control to prevent blocking
      if (config.speed > 0) {
        await this.sleep(config.speed)
      } else if (this.stats.handsPlayed % 100 === 0) {
        await this.sleep(1) // Minimal delay every 100 hands
      }
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(
      `✅ Simulation complete: ${this.stats.handsPlayed} hands in ${duration}ms`
    )

    this.isRunning = false
    this.emit('complete', {
      ...this.stats.getFinalResults(),
      duration
    })
  }

  /**
   * Simulate a single poker hand
   */
  simulateHand(config) {
    // Create a fresh deck for each hand to ensure proper randomness
    const deck = new Deck()
    deck.shuffle()

    const initialHand = deck.dealHand(5)

    // Determine holds based on strategy
    let holds
    if (config.strategy === 'optimal') {
      holds = this.optimalStrategy.getOptimalHolds(initialHand)
    } else if (config.strategy === 'aces-high') {
      holds = this.getAcesHighHolds(initialHand)
    } else if (config.strategy === 'aces-optimal') {
      holds = this.getAcesOptimalHolds(initialHand)
    } else {
      holds = this.getRandomHolds()
    }

    // Create final hand by replacing non-held cards
    const finalHand = [...initialHand]
    for (let i = 0; i < 5; i++) {
      if (!holds.has(i)) {
        finalHand[i] = deck.deal()
      }
    }

    // Evaluate the final hand
    const handResult = this.gameEngine.handEvaluator.evaluate(finalHand)
    const payout = this.gameEngine.paytableManager.calculatePayout(
      handResult.category,
      config.bet
    )

    return {
      initialHand: initialHand.map(c => c.toString()),
      finalHand: finalHand.map(c => c.toString()),
      holds: Array.from(holds),
      handResult,
      payout,
      bet: config.bet,
      strategy: config.strategy
    }
  }

  /**
   * Get random holds (for comparison)
   */
  getRandomHolds() {
    const holds = new Set()
    for (let i = 0; i < 5; i++) {
      if (Math.random() < 0.3) {
        // 30% chance to hold each card
        holds.add(i)
      }
    }
    return holds
  }

  /**
   * Get holds using "Aces Always Held" strategy - always hold any Aces
   */
  getAcesHighHolds(hand) {
    const holds = new Set()

    // First, always hold any Aces
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].rank === 'A') {
        holds.add(i)
      }
    }

    // If we have Aces, just hold those and draw the rest
    if (holds.size > 0) {
      return holds
    }

    // If no Aces, fall back to optimal strategy
    return this.optimalStrategy.getOptimalHolds(hand)
  }

  /**
   * Get holds using "Aces Held with Optimal" strategy - always hold Aces but also use optimal strategy
   */
  getAcesOptimalHolds(hand) {
    // Start with optimal strategy holds
    const optimalHolds = this.optimalStrategy.getOptimalHolds(hand)

    // Always add any Aces to the holds
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].rank === 'A') {
        optimalHolds.add(i)
      }
    }

    return optimalHolds
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => {
      this.timeoutId = setTimeout(resolve, ms)
    })
  }

  /**
   * Get current simulation statistics
   */
  getCurrentStats() {
    return this.stats.getCurrentStats()
  }

  /**
   * Check if simulation is running
   */
  isSimulationRunning() {
    return this.isRunning
  }

  /**
   * Get simulation progress
   */
  getProgress() {
    return {
      handsPlayed: this.stats.handsPlayed,
      totalHands: this.stats.totalHands,
      progress:
        this.stats.totalHands > 0
          ? (this.stats.handsPlayed / this.stats.totalHands) * 100
          : 0,
      isRunning: this.isRunning
    }
  }

  /**
   * Reset simulation state
   */
  reset() {
    this.stopSimulation()
    this.stats.reset()
  }
}
