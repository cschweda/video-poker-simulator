import { SimulationStats } from './src/js/SimulationStats.js'

console.log('=== TESTING SIMULATION STATS ===')

// Test 1: Manual stats calculation
console.log('\n--- Test 1: Manual Stats Calculation ---')
const stats = new SimulationStats()

// Add some known hands manually
const testHands = [
  { bet: 5, payout: 0, handResult: { category: 'High Card' } },    // Loss: -5
  { bet: 5, payout: 0, handResult: { category: 'Low Pair' } },     // Loss: -5  
  { bet: 5, payout: 10, handResult: { category: 'Jacks or Better' } }, // Win: +5
  { bet: 5, payout: 0, handResult: { category: 'High Card' } },    // Loss: -5
  { bet: 5, payout: 15, handResult: { category: 'Two Pair' } }     // Win: +10
]

console.log('Adding test hands:')
testHands.forEach((hand, i) => {
  stats.addHand(hand)
  console.log(`Hand ${i + 1}: Bet ${hand.bet}, Payout ${hand.payout}, Net ${hand.payout - hand.bet}`)
})

const currentStats = stats.getCurrentStats()
console.log('\nCalculated stats:')
console.log(`  Hands played: ${currentStats.handsPlayed}`)
console.log(`  Total wagered: ${currentStats.totalWagered}`)
console.log(`  Total won: ${currentStats.totalWon}`)
console.log(`  Net result: ${currentStats.net}`)
console.log(`  RTP: ${currentStats.rtp.toFixed(2)}%`)

// Manual verification
const expectedWagered = 5 * 5 // 5 hands × 5 bet
const expectedWon = 0 + 0 + 10 + 0 + 15 // Sum of payouts
const expectedNet = expectedWon - expectedWagered
const expectedRTP = (expectedWon / expectedWagered) * 100

console.log('\nExpected stats:')
console.log(`  Hands played: 5`)
console.log(`  Total wagered: ${expectedWagered}`)
console.log(`  Total won: ${expectedWon}`)
console.log(`  Net result: ${expectedNet}`)
console.log(`  RTP: ${expectedRTP.toFixed(2)}%`)

console.log(`\nStats match: ${
  currentStats.handsPlayed === 5 &&
  currentStats.totalWagered === expectedWagered &&
  currentStats.totalWon === expectedWon &&
  currentStats.net === expectedNet &&
  Math.abs(currentStats.rtp - expectedRTP) < 0.01
  ? 'YES ✓' : 'NO ✗'
}`)

// Test 2: Test with actual simulation data
console.log('\n--- Test 2: Actual Simulation Data ---')
import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'
import { Deck } from './src/js/Card.js'

const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simStats = new SimulationStats()

let manualTotalWagered = 0
let manualTotalWon = 0

console.log('Running 10 hands with manual tracking:')
for (let i = 0; i < 10; i++) {
  // Simulate one hand manually
  const deck = new Deck()
  deck.shuffle()
  
  const initialHand = deck.dealHand(5)
  const holds = new Set() // No strategy - hold nothing
  
  const finalHand = [...initialHand]
  for (let j = 0; j < 5; j++) {
    if (!holds.has(j)) {
      finalHand[j] = deck.deal()
    }
  }
  
  const handResult = gameEngine.handEvaluator.evaluate(finalHand)
  const payout = paytableManager.calculatePayout(handResult.category, 5)
  
  // Track manually
  manualTotalWagered += 5
  manualTotalWon += payout
  
  // Add to SimulationStats
  simStats.addHand({
    bet: 5,
    payout: payout,
    handResult: handResult
  })
  
  console.log(`Hand ${i + 1}: ${handResult.category}, Payout: ${payout}, Net: ${payout - 5}`)
}

const finalStats = simStats.getCurrentStats()
const manualRTP = (manualTotalWon / manualTotalWagered) * 100

console.log('\nManual tracking:')
console.log(`  Total wagered: ${manualTotalWagered}`)
console.log(`  Total won: ${manualTotalWon}`)
console.log(`  RTP: ${manualRTP.toFixed(2)}%`)

console.log('\nSimulationStats tracking:')
console.log(`  Total wagered: ${finalStats.totalWagered}`)
console.log(`  Total won: ${finalStats.totalWon}`)
console.log(`  RTP: ${finalStats.rtp.toFixed(2)}%`)

console.log(`\nTracking matches: ${
  finalStats.totalWagered === manualTotalWagered &&
  finalStats.totalWon === manualTotalWon &&
  Math.abs(finalStats.rtp - manualRTP) < 0.01
  ? 'YES ✓' : 'NO ✗'
}`)
