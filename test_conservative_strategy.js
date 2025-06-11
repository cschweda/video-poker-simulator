import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'
import { Card } from './src/js/Card.js'

// Create a conservative strategy for testing
class ConservativeStrategy {
  constructor() {
    this.handEvaluator = null // We don't need this for basic strategy
  }

  getOptimalHolds(hand) {
    if (!hand || hand.length !== 5) {
      throw new Error('Hand must contain exactly 5 cards')
    }

    const analysis = this.analyzeHand(hand)
    return this.applyConservativeRules(hand, analysis)
  }

  analyzeHand(hand) {
    const ranks = hand.map(card => card.getValue())
    const suits = hand.map(card => card.suit)
    
    // Count ranks and suits
    const rankCounts = {}
    const suitCounts = {}
    
    ranks.forEach(rank => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1
    })
    
    suits.forEach(suit => {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1
    })
    
    // Find pairs, trips, quads
    const pairs = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 2)
    const trips = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 3)
    const quads = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 4)
    
    // Check for high cards (J, Q, K, A)
    const highCards = []
    hand.forEach((card, index) => {
      if (card.getValue() === 1 || card.getValue() >= 11) {
        highCards.push(index)
      }
    })
    
    return {
      rankCounts,
      suitCounts,
      pairs: pairs.map(r => parseInt(r)),
      trips: trips.map(r => parseInt(r)),
      quads: quads.map(r => parseInt(r)),
      highCards
    }
  }

  applyConservativeRules(hand, analysis) {
    const holds = new Set()

    // Rule 1: Four of a kind - keep all four
    if (analysis.quads.length > 0) {
      const quadRank = analysis.quads[0]
      hand.forEach((card, i) => {
        if (card.getValue() === quadRank) holds.add(i)
      })
      return holds
    }

    // Rule 2: Full house - keep everything
    if (analysis.trips.length > 0 && analysis.pairs.length > 0) {
      return new Set([0, 1, 2, 3, 4])
    }

    // Rule 3: Three of a kind
    if (analysis.trips.length > 0) {
      const tripRank = analysis.trips[0]
      hand.forEach((card, i) => {
        if (card.getValue() === tripRank) holds.add(i)
      })
      return holds
    }

    // Rule 4: High pairs (Jacks or better)
    const highPairs = analysis.pairs.filter(rank => rank === 1 || rank >= 11)
    if (highPairs.length > 0) {
      const pairRank = highPairs[0]
      hand.forEach((card, i) => {
        if (card.getValue() === pairRank) holds.add(i)
      })
      return holds
    }

    // Rule 5: Low pairs
    const lowPairs = analysis.pairs.filter(rank => rank !== 1 && rank < 11)
    if (lowPairs.length > 0) {
      const pairRank = lowPairs[0]
      hand.forEach((card, i) => {
        if (card.getValue() === pairRank) holds.add(i)
      })
      return holds
    }

    // Rule 6: Single high card (be conservative - only hold 1)
    if (analysis.highCards.length > 0) {
      // Just hold the first high card
      holds.add(analysis.highCards[0])
      return holds
    }

    // Default: Hold nothing (draw 5 new cards)
    return holds
  }
}

// Test the conservative strategy
console.log('=== TESTING CONSERVATIVE STRATEGY ===')

const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

// Replace the optimal strategy with our conservative one
simulationEngine.optimalStrategy = new ConservativeStrategy()

console.log('\n--- Conservative Strategy Test (1000 hands) ---')
let conservativeTotalPayout = 0
let conservativeTotalBet = 0
for (let i = 0; i < 1000; i++) {
  const handResult = simulationEngine.simulateHand({ bet: 5, strategy: 'optimal' })
  conservativeTotalPayout += handResult.payout
  conservativeTotalBet += handResult.bet
  
  if (i < 5) {
    console.log(`Hand ${i + 1}:`, {
      initial: handResult.initialHand.join(', '),
      final: handResult.finalHand.join(', '),
      holds: handResult.holds,
      category: handResult.handResult.category,
      payout: handResult.payout,
      net: handResult.payout - handResult.bet
    })
  }
}

console.log(
  `Conservative strategy 1000 hands: ${conservativeTotalPayout} won vs ${conservativeTotalBet} bet = ${((conservativeTotalPayout / conservativeTotalBet) * 100).toFixed(2)}% RTP`
)
