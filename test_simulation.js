import { GameEngine } from './src/js/GameEngine.js'
import { SimulationEngine } from './src/js/SimulationEngine.js'
import { PaytableManager } from './src/js/PaytableManager.js'

console.log('🔧 Testing Simulation Engine...')

// Create instances
const paytableManager = new PaytableManager()
const gameEngine = new GameEngine(paytableManager)
const simulationEngine = new SimulationEngine(gameEngine)

console.log('✅ All instances created successfully')

// Test event listeners
let progressCount = 0
let completeReceived = false
let errorReceived = false

simulationEngine.on('progress', (data) => {
  progressCount++
  if (progressCount <= 5) {
    console.log(`📊 Progress ${progressCount}: ${data.handsPlayed}/${data.totalHands} (${data.progress.toFixed(1)}%)`)
    console.log(`   Latest hand: ${data.latestHand.handResult.description}, Payout: ${data.latestHand.payout}`)
  }
})

simulationEngine.on('complete', (data) => {
  completeReceived = true
  console.log('✅ Simulation complete!')
  console.log(`   Hands played: ${data.handsPlayed}`)
  console.log(`   Total wagered: ${data.totalWagered}`)
  console.log(`   Total won: ${data.totalWon}`)
  console.log(`   Net result: ${data.net}`)
  console.log(`   RTP: ${data.rtp.toFixed(2)}%`)
  console.log(`   Duration: ${data.duration}ms`)
  console.log(`   Graph data points: ${data.graphData?.length || 0}`)
})

simulationEngine.on('error', (error) => {
  errorReceived = true
  console.error('❌ Simulation error:', error)
})

// Test simulation
console.log('🎰 Starting test simulation...')

try {
  await simulationEngine.startSimulation({
    totalHands: 100,
    speed: 1,
    strategy: 'optimal',
    bet: 5
  })
  
  console.log('\n📋 Test Results:')
  console.log(`   Progress events received: ${progressCount}`)
  console.log(`   Complete event received: ${completeReceived}`)
  console.log(`   Error event received: ${errorReceived}`)
  
  if (completeReceived && progressCount > 0 && !errorReceived) {
    console.log('🎉 Simulation test PASSED!')
  } else {
    console.log('❌ Simulation test FAILED!')
  }
  
} catch (error) {
  console.error('❌ Test failed with error:', error.message)
  console.error('Stack trace:', error.stack)
}
