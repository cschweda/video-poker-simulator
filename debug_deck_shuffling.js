import { Deck } from './src/js/Card.js'

console.log('=== TESTING DECK SHUFFLING ===')

// Test 1: Verify deck shuffling produces different results
console.log('\n--- Test 1: Deck Shuffling Randomness ---')
const deck1 = new Deck()
const deck2 = new Deck()

deck1.shuffle()
deck2.shuffle()

const cards1 = deck1.getCards().slice(0, 10).map(c => c.toString())
const cards2 = deck2.getCards().slice(0, 10).map(c => c.toString())

console.log('Deck 1 first 10 cards:', cards1.join(', '))
console.log('Deck 2 first 10 cards:', cards2.join(', '))
console.log('Are they different?', JSON.stringify(cards1) !== JSON.stringify(cards2) ? 'YES ✓' : 'NO ✗')

// Test 2: Verify deck reset and shuffle between hands
console.log('\n--- Test 2: Deck Reset Between Hands ---')
for (let hand = 1; hand <= 3; hand++) {
  const deck = new Deck()
  deck.shuffle()
  
  console.log(`Hand ${hand}:`)
  console.log(`  Deck size before dealing: ${deck.size()}`)
  
  // Deal initial 5 cards
  const initialHand = deck.dealHand(5)
  console.log(`  Initial hand: ${initialHand.map(c => c.toString()).join(', ')}`)
  console.log(`  Deck size after initial deal: ${deck.size()}`)
  
  // Deal replacement cards (simulate drawing 3 new cards)
  const replacements = []
  for (let i = 0; i < 3; i++) {
    replacements.push(deck.deal())
  }
  console.log(`  Replacement cards: ${replacements.map(c => c.toString()).join(', ')}`)
  console.log(`  Deck size after replacements: ${deck.size()}`)
  console.log()
}

// Test 3: Check if Math.random() is working properly
console.log('\n--- Test 3: Math.random() Distribution ---')
const randomSample = []
for (let i = 0; i < 100; i++) {
  randomSample.push(Math.random())
}

const avg = randomSample.reduce((sum, val) => sum + val, 0) / randomSample.length
const min = Math.min(...randomSample)
const max = Math.max(...randomSample)

console.log(`Random sample (100 values):`)
console.log(`  Average: ${avg.toFixed(4)} (should be ~0.5)`)
console.log(`  Min: ${min.toFixed(4)} (should be close to 0)`)
console.log(`  Max: ${max.toFixed(4)} (should be close to 1)`)
console.log(`  Range looks good: ${(avg > 0.4 && avg < 0.6 && min < 0.1 && max > 0.9) ? 'YES ✓' : 'NO ✗'}`)

// Test 4: Simulate the exact same process as SimulationEngine
console.log('\n--- Test 4: Simulate Exact SimulationEngine Process ---')
import { GameEngine } from './src/js/GameEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'

const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)

for (let hand = 1; hand <= 5; hand++) {
  // This is exactly what SimulationEngine.simulateHand() does
  const deck = new Deck()
  deck.shuffle()
  
  const initialHand = deck.dealHand(5)
  console.log(`Hand ${hand} initial: ${initialHand.map(c => c.toString()).join(', ')}`)
  
  // Simulate holding nothing (like our no-strategy test)
  const holds = new Set()
  
  // Create final hand by replacing non-held cards
  const finalHand = [...initialHand]
  for (let i = 0; i < 5; i++) {
    if (!holds.has(i)) {
      finalHand[i] = deck.deal()
    }
  }
  
  console.log(`Hand ${hand} final:   ${finalHand.map(c => c.toString()).join(', ')}`)
  
  // Evaluate the hand
  const handResult = gameEngine.handEvaluator.evaluate(finalHand)
  const payout = paytableManager.calculatePayout(handResult.category, 5)
  
  console.log(`Hand ${hand} result:  ${handResult.category}, Payout: ${payout}, Net: ${payout - 5}`)
  console.log()
}
