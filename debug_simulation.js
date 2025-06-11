import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'
import { Card } from './src/js/Card.js'
import { OptimalStrategy } from './src/js/OptimalStrategy.js'

// Create instances
const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

console.log('=== DEBUGGING SIMULATION ===')

// Test payout calculation directly
console.log('\n--- Direct Payout Tests ---')
console.log(
  'Jacks or Better, 5 bet:',
  paytableManager.calculatePayout('Jacks or Better', 5)
)
console.log('Two Pair, 5 bet:', paytableManager.calculatePayout('Two Pair', 5))
console.log(
  'High Card, 5 bet:',
  paytableManager.calculatePayout('High Card', 5)
)
console.log('No category, 5 bet:', paytableManager.calculatePayout('No Win', 5))

// Test a few simulation hands
console.log('\n--- Simulation Hand Tests ---')
let totalPayout = 0
let totalBet = 0
for (let i = 0; i < 1000; i++) {
  const handResult = simulationEngine.simulateHand({
    bet: 5,
    strategy: 'optimal'
  })
  totalPayout += handResult.payout
  totalBet += handResult.bet

  if (i < 10) {
    console.log(`Hand ${i + 1}:`, {
      initial: handResult.initialHand.join(', '),
      final: handResult.finalHand.join(', '),
      holds: handResult.holds,
      category: handResult.handResult.category,
      payout: handResult.payout,
      bet: handResult.bet,
      net: handResult.payout - handResult.bet
    })
  }
}

console.log(
  `\n1000 hands summary: ${totalPayout} won vs ${totalBet} bet = ${((totalPayout / totalBet) * 100).toFixed(2)}% RTP`
)

// Test with random strategy
console.log('\n--- Random Strategy Test ---')
let randomTotalPayout = 0
let randomTotalBet = 0
for (let i = 0; i < 1000; i++) {
  const handResult = simulationEngine.simulateHand({
    bet: 5,
    strategy: 'random'
  })
  randomTotalPayout += handResult.payout
  randomTotalBet += handResult.bet
}

console.log(
  `Random strategy 1000 hands: ${randomTotalPayout} won vs ${randomTotalBet} bet = ${((randomTotalPayout / randomTotalBet) * 100).toFixed(2)}% RTP`
)

// Test simulation stats
console.log('\n--- Simulation Stats Test ---')
const stats = simulationEngine.stats
stats.reset()

// Add some test hands manually
stats.addHand({
  bet: 5,
  payout: 10,
  handResult: { category: 'Jacks or Better' }
}) // Win
stats.addHand({ bet: 5, payout: 0, handResult: { category: 'High Card' } }) // Loss
stats.addHand({ bet: 5, payout: 15, handResult: { category: 'Two Pair' } }) // Win

const currentStats = stats.getCurrentStats()
console.log('Manual stats test:', {
  handsPlayed: currentStats.handsPlayed,
  totalWagered: currentStats.totalWagered,
  totalWon: currentStats.totalWon,
  net: currentStats.net,
  rtp: currentStats.rtp
})

console.log('\nExpected: 3 hands, 15 wagered, 25 won, +10 net, 166.67% RTP')

// Test specific strategy decisions
console.log('\n--- Strategy Decision Tests ---')
const strategy = new OptimalStrategy()

// Test some specific hands
const testHands = [
  // Should hold the pair of Jacks
  [
    new Card('J', '♥'),
    new Card('J', '♠'),
    new Card('3', '♦'),
    new Card('7', '♣'),
    new Card('9', '♠')
  ],
  // Should hold nothing (all low cards)
  [
    new Card('2', '♥'),
    new Card('4', '♠'),
    new Card('6', '♦'),
    new Card('8', '♣'),
    new Card('9', '♠')
  ],
  // Should hold the Ace
  [
    new Card('A', '♥'),
    new Card('4', '♠'),
    new Card('6', '♦'),
    new Card('8', '♣'),
    new Card('9', '♠')
  ]
]

testHands.forEach((hand, i) => {
  const holds = strategy.getOptimalHolds(hand)
  console.log(`Test hand ${i + 1}: ${hand.map(c => c.toString()).join(', ')}`)
  console.log(`  Holds: [${Array.from(holds).join(', ')}]`)
  console.log(
    `  Held cards: ${Array.from(holds)
      .map(idx => hand[idx].toString())
      .join(', ')}`
  )
})
