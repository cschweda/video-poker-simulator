import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'

// Create a "no strategy" that always holds nothing
class NoStrategy {
  getOptimalHolds(hand) {
    return new Set() // Never hold anything - always draw 5 new cards
  }
}

// Test with no strategy at all
console.log('=== TESTING NO STRATEGY (ALWAYS DRAW 5) ===')

const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

// Replace the optimal strategy with our no-strategy
simulationEngine.optimalStrategy = new NoStrategy()

console.log('\n--- No Strategy Test (1000 hands) ---')
let noStrategyTotalPayout = 0
let noStrategyTotalBet = 0
let winCount = 0
let lossCount = 0

for (let i = 0; i < 1000; i++) {
  const handResult = simulationEngine.simulateHand({ bet: 5, strategy: 'optimal' })
  noStrategyTotalPayout += handResult.payout
  noStrategyTotalBet += handResult.bet
  
  if (handResult.payout > 0) {
    winCount++
  } else {
    lossCount++
  }
  
  if (i < 10) {
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
  `No strategy 1000 hands: ${noStrategyTotalPayout} won vs ${noStrategyTotalBet} bet = ${((noStrategyTotalPayout / noStrategyTotalBet) * 100).toFixed(2)}% RTP`
)
console.log(`Wins: ${winCount}, Losses: ${lossCount}, Win rate: ${((winCount / 1000) * 100).toFixed(1)}%`)

// Also test what happens if we manually calculate some payouts
console.log('\n--- Manual Payout Verification ---')
const testPayouts = [
  { category: 'Jacks or Better', bet: 5, expected: 10 },
  { category: 'Two Pair', bet: 5, expected: 15 },
  { category: 'Three of a Kind', bet: 5, expected: 20 },
  { category: 'High Card', bet: 5, expected: 0 },
  { category: 'Low Pair', bet: 5, expected: 0 }
]

testPayouts.forEach(test => {
  const actual = paytableManager.calculatePayout(test.category, test.bet)
  console.log(`${test.category}: Expected ${test.expected}, Got ${actual} ${actual === test.expected ? '✓' : '✗'}`)
})
