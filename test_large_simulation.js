import { GameEngine } from './src/js/GameEngine.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'

console.log('🔧 Testing Large Simulation for RTP Accuracy...')

// Create instances
const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

console.log('✅ All instances created successfully')

// Test with larger sample size
let progressCount = 0

simulationEngine.on('progress', (data) => {
  progressCount++
  if (progressCount % 10 === 0) {
    console.log(`📊 Progress: ${data.handsPlayed}/${data.totalHands} (${data.progress.toFixed(1)}%) - RTP: ${data.currentStats.rtp.toFixed(2)}%`)
  }
})

simulationEngine.on('complete', (data) => {
  console.log('\n✅ Large Simulation Complete!')
  console.log(`   Hands played: ${data.handsPlayed.toLocaleString()}`)
  console.log(`   Total wagered: ${data.totalWagered.toLocaleString()}`)
  console.log(`   Total won: ${data.totalWon.toLocaleString()}`)
  console.log(`   Net result: ${data.net >= 0 ? '+' : ''}${data.net.toLocaleString()}`)
  console.log(`   RTP: ${data.rtp.toFixed(2)}%`)
  console.log(`   Win rate: ${data.winRate.toFixed(1)}%`)
  console.log(`   Duration: ${(data.duration / 1000).toFixed(1)}s`)
  
  // Show hand frequency breakdown
  console.log('\n📊 Hand Frequency Breakdown:')
  const frequencies = data.handFrequencies
  Object.entries(frequencies).forEach(([hand, stats]) => {
    if (stats.count > 0) {
      console.log(`   ${hand}: ${stats.count} (${stats.frequency.toFixed(2)}%)`)
    }
  })
  
  // Analysis
  console.log('\n🔍 Analysis:')
  if (data.rtp > 100) {
    console.log(`   ⚠️  RTP of ${data.rtp.toFixed(2)}% is too high - should be ~99.54% for optimal play`)
  } else if (data.rtp >= 98 && data.rtp <= 101) {
    console.log(`   ✅ RTP of ${data.rtp.toFixed(2)}% looks reasonable`)
  } else {
    console.log(`   ❌ RTP of ${data.rtp.toFixed(2)}% seems incorrect`)
  }
})

simulationEngine.on('error', (error) => {
  console.error('❌ Simulation error:', error)
})

// Test with different strategies and sample sizes
async function runTests() {
  console.log('\n🎰 Running 10,000 hand simulation with optimal strategy...')
  
  try {
    await simulationEngine.startSimulation({
      totalHands: 10000,
      speed: 0, // No delay for faster testing
      strategy: 'optimal',
      bet: 5
    })
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

runTests()
