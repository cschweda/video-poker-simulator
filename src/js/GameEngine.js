import { Card, Deck } from './Card.js'
import { HandEvaluator } from './HandEvaluator.js'
import { GameState } from './GameState.js'

/**
 * Core game engine for video poker
 */
export class GameEngine {
  constructor(paytableManager) {
    this.paytableManager = paytableManager
    this.handEvaluator = new HandEvaluator()
    this.gameState = new GameState()
    this.deck = new Deck()

    // Event listeners
    this.listeners = {
      stateChange: [],
      handComplete: [],
      error: []
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
   * Get current game state
   */
  getState() {
    return this.gameState.toObject()
  }

  /**
   * Deal a new hand
   */
  deal() {
    try {
      if (this.gameState.credits < this.gameState.bet) {
        throw new Error('Insufficient credits!')
      }

      console.log('=== DEALING NEW HAND ===')

      // Deduct bet and reset state
      this.gameState.credits -= this.gameState.bet
      this.gameState.currentWin = 0
      this.gameState.heldCards.clear()
      this.gameState.newCards.clear()

      // Reset deck to full 52 cards and shuffle
      this.deck.reset().shuffle()
      this.gameState.currentHand = []
      for (let i = 0; i < 5; i++) {
        this.gameState.currentHand.push(this.deck.deal())
      }

      console.log(
        'Dealt:',
        this.gameState.currentHand.map(c => c.toString()).join(', ')
      )

      // Update game phase
      this.gameState.gamePhase = 'holding'

      this.emit('stateChange', this.getState())
      return this.getState()
    } catch (error) {
      this.emit('error', error.message)
      throw error
    }
  }

  /**
   * Toggle hold status for a card
   */
  toggleHold(cardIndex) {
    if (this.gameState.gamePhase !== 'holding') {
      return false
    }

    if (cardIndex < 0 || cardIndex >= 5) {
      return false
    }

    if (this.gameState.heldCards.has(cardIndex)) {
      this.gameState.heldCards.delete(cardIndex)
      console.log(`Released hold on card ${cardIndex + 1}`)
    } else {
      this.gameState.heldCards.add(cardIndex)
      console.log(`Holding card ${cardIndex + 1}`)
    }

    this.emit('stateChange', this.getState())
    return true
  }

  /**
   * Draw replacement cards and evaluate hand
   */
  draw() {
    try {
      if (this.gameState.gamePhase !== 'holding') {
        throw new Error('Cannot draw in current game phase')
      }

      console.log('=== DRAWING CARDS ===')

      // Track which cards will be replaced
      this.gameState.newCards.clear()

      // Replace non-held cards
      for (let i = 0; i < 5; i++) {
        if (!this.gameState.heldCards.has(i)) {
          this.gameState.currentHand[i] = this.deck.deal()
          this.gameState.newCards.add(i)
        }
      }

      console.log(
        'Final hand:',
        this.gameState.currentHand.map(c => c.toString()).join(', ')
      )

      // Evaluate hand and calculate payout
      const handResult = this.handEvaluator.evaluate(this.gameState.currentHand)
      const totalPayout = this.paytableManager.calculatePayout(
        handResult.category,
        this.gameState.bet
      )

      // Update game state
      // totalPayout already includes bet return + winnings
      this.gameState.currentWin = totalPayout
      this.gameState.handsPlayed++

      if (totalPayout > 0) {
        this.gameState.credits += totalPayout
      }

      const netWin = totalPayout - this.gameState.bet
      console.log(
        `Result: ${handResult.description}, Total Payout: ${totalPayout}, Net Win: ${netWin >= 0 ? '+' : ''}${netWin}`
      )

      // Update game phase
      this.gameState.gamePhase = 'finished'

      const finalState = this.getState()
      this.emit('stateChange', finalState)
      this.emit('handComplete', {
        ...finalState,
        handResult,
        payout: totalPayout
      })

      return {
        handResult,
        payout: totalPayout,
        gameState: finalState
      }
    } catch (error) {
      this.emit('error', error.message)
      throw error
    }
  }

  /**
   * Set bet amount
   */
  setBet(amount) {
    if (this.gameState.gamePhase === 'holding') {
      return false
    }

    if (amount < 1 || amount > 5) {
      return false
    }

    if (amount === this.gameState.bet) {
      return false // No change needed
    }

    this.gameState.bet = amount
    this.emit('stateChange', this.getState())
    return true
  }

  /**
   * Increase bet by one
   */
  betOne() {
    return this.setBet(Math.min(this.gameState.bet + 1, 5))
  }

  /**
   * Set bet to maximum and deal
   */
  betMax() {
    // Always set bet to 5 and deal, regardless of current bet
    this.gameState.bet = 5
    this.emit('stateChange', this.getState())
    return this.deal()
  }

  /**
   * Reset credits to specified amount
   */
  resetCredits(amount = 5000) {
    if (amount < 100 || amount > 10000) {
      return false
    }

    this.gameState.credits = amount
    this.gameState.startingCredits = amount
    this.gameState.handsPlayed = 0
    this.gameState.gamePhase = 'ready'
    this.gameState.heldCards.clear()
    this.gameState.newCards.clear()
    this.gameState.currentWin = 0

    this.emit('stateChange', this.getState())
    return true
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const sessionNet = this.gameState.credits - this.gameState.startingCredits
    return {
      handsPlayed: this.gameState.handsPlayed,
      sessionNet,
      startingCredits: this.gameState.startingCredits,
      currentCredits: this.gameState.credits
    }
  }

  /**
   * Check if game can continue
   */
  canContinue() {
    return this.gameState.credits >= this.gameState.bet
  }
}
