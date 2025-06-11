import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'
import { Deck } from './src/js/Card.js'

console.log('=== COMPARING MANUAL VS SIMULATIONENGINE ===')

// Create a no-strategy for testing
class NoStrategy {
  getOptimalHolds(hand) {
    return new Set() // Never hold anything
  }
}

const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

// Replace strategy with no-strategy
simulationEngine.optimalStrategy = new NoStrategy()

console.log('\n--- Comparing 10 hands: Manual vs SimulationEngine ---')

let manualTotalWagered = 0
let manualTotalWon = 0
let engineTotalWagered = 0
let engineTotalWon = 0

for (let i = 0; i < 10; i++) {
  // Method 1: Manual simulation (like our working debug)
  const deck1 = new Deck()
  deck1.shuffle()
  
  const initialHand1 = deck1.dealHand(5)
  const holds1 = new Set() // No strategy
  
  const finalHand1 = [...initialHand1]
  for (let j = 0; j < 5; j++) {
    if (!holds1.has(j)) {
      finalHand1[j] = deck1.deal()
    }
  }
  
  const handResult1 = gameEngine.handEvaluator.evaluate(finalHand1)
  const payout1 = paytableManager.calculatePayout(handResult1.category, 5)
  
  manualTotalWagered += 5
  manualTotalWon += payout1
  
  // Method 2: SimulationEngine.simulateHand()
  const engineResult = simulationEngine.simulateHand({ bet: 5, strategy: 'optimal' })
  
  engineTotalWagered += engineResult.bet
  engineTotalWon += engineResult.payout
  
  console.log(`Hand ${i + 1}:`)
  console.log(`  Manual:     ${handResult1.category}, Payout: ${payout1}, Net: ${payout1 - 5}`)
  console.log(`  Engine:     ${engineResult.handResult.category}, Payout: ${engineResult.payout}, Net: ${engineResult.payout - engineResult.bet}`)
  console.log(`  Match:      ${payout1 === engineResult.payout ? '✓' : '✗'}`)
  console.log()
}

const manualRTP = (manualTotalWon / manualTotalWagered) * 100
const engineRTP = (engineTotalWon / engineTotalWagered) * 100

console.log('Final Results:')
console.log(`Manual:  ${manualTotalWon} won vs ${manualTotalWagered} bet = ${manualRTP.toFixed(2)}% RTP`)
console.log(`Engine:  ${engineTotalWon} won vs ${engineTotalWagered} bet = ${engineRTP.toFixed(2)}% RTP`)
console.log(`Match:   ${Math.abs(manualRTP - engineRTP) < 0.01 ? 'YES ✓' : 'NO ✗'}`)

// Test 2: Check if there's an issue with the loop in our original test
console.log('\n--- Test 2: Checking Original Loop Logic ---')
let loopTotalPayout = 0
let loopTotalBet = 0

for (let i = 0; i < 100; i++) {
  const handResult = simulationEngine.simulateHand({ bet: 5, strategy: 'optimal' })
  loopTotalPayout += handResult.payout
  loopTotalBet += handResult.bet
  
  if (i < 5) {
    console.log(`Loop Hand ${i + 1}: ${handResult.handResult.category}, Payout: ${handResult.payout}, Net: ${handResult.payout - handResult.bet}`)
  }
}

const loopRTP = (loopTotalPayout / loopTotalBet) * 100
console.log(`\nLoop test (100 hands): ${loopTotalPayout} won vs ${loopTotalBet} bet = ${loopRTP.toFixed(2)}% RTP`)

// Test 3: Check the exact same logic as our original failing test
console.log('\n--- Test 3: Exact Same Logic as Original Test ---')
let exactTotalPayout = 0
let exactTotalBet = 0

for (let i = 0; i < 100; i++) {
  const handResult = simulationEngine.simulateHand({ bet: 5, strategy: 'optimal' })
  exactTotalPayout += handResult.payout
  exactTotalBet += handResult.bet
}

console.log(
  `Exact test (100 hands): ${exactTotalPayout} won vs ${exactTotalBet} bet = ${((exactTotalPayout / exactTotalBet) * 100).toFixed(2)}% RTP`
)
