import { GameEngine } from './js/GameEngine.js'
import { SimulationEngine } from './js/SimulationEngine.js'
import { UIController } from './js/UIController.js'
import { PaytableManager } from './js/PaytableManager.js'

/**
 * Video Poker Simulator - Main Entry Point
 * Professional video poker simulator with optimal strategy analysis
 */
class VideoPokerApp {
  constructor() {
    this.gameEngine = null
    this.simulationEngine = null
    this.uiController = null
    this.paytableManager = null
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Video Poker Simulator...')

      // Initialize core components
      this.paytableManager = new PaytableManager()
      this.gameEngine = new GameEngine(this.paytableManager)
      this.simulationEngine = new SimulationEngine(this.gameEngine)
      this.uiController = new UIController(
        this.gameEngine,
        this.simulationEngine,
        this.paytableManager
      )

      // Setup event listeners and initial state
      await this.uiController.init()

      console.log('✅ Video Poker Simulator initialized successfully!')
    } catch (error) {
      console.error('❌ Failed to initialize Video Poker Simulator:', error)
      console.error('Stack trace:', error.stack)
      this.showErrorMessage(
        'Failed to initialize the game. Please refresh the page.'
      )
    }
  }

  /**
   * Show error message to user
   */
  showErrorMessage(message) {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(145deg, #e74c3c, #c0392b);
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      font-family: 'Orbitron', monospace;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    `
    errorDiv.textContent = message
    document.body.appendChild(errorDiv)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 5000)
  }
}

// Initialize the application when DOM is ready
function initializeApp() {
  console.log('🔄 DOM ready, initializing app...')

  // Double-check that critical elements exist
  const criticalElements = [
    'startSim',
    'stopSim',
    'simHands',
    'simSpeed',
    'simStrategy'
  ]
  const missingElements = criticalElements.filter(
    id => !document.getElementById(id)
  )

  if (missingElements.length > 0) {
    console.error('❌ Critical elements missing:', missingElements)
    console.log('🔄 Retrying in 100ms...')
    setTimeout(initializeApp, 100)
    return
  }

  console.log('✅ All critical elements found, proceeding with initialization')
  const app = new VideoPokerApp()
  app.init()
}

// Try multiple initialization methods for maximum compatibility
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // DOM is already ready
  initializeApp()
}

// Fallback initialization
window.addEventListener('load', () => {
  console.log('🔄 Window load event fired')
  // Only initialize if not already done
  if (!window.videoPokerAppInitialized) {
    console.log('🔄 App not yet initialized, trying again...')
    initializeApp()
  }
})

// Export for testing
export { VideoPokerApp }
