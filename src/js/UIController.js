/**
 * User Interface Controller
 * Manages all UI interactions and updates
 */
export class UIController {
  constructor(gameEngine, simulationEngine, paytableManager) {
    this.gameEngine = gameEngine
    this.simulationEngine = simulationEngine
    this.paytableManager = paytableManager

    // DOM elements cache
    this.elements = {}

    // State
    this.isSimulationRunning = false
  }

  /**
   * Initialize the UI controller
   */
  async init() {
    try {
      console.log('🎨 Initializing UI Controller...')

      // Cache DOM elements
      this.cacheElements()

      // Setup event listeners
      this.setupEventListeners()

      // Initialize paytable display
      this.buildPaytable()

      // Initial display update
      this.updateDisplay()

      console.log('✅ UI Controller initialized')
    } catch (error) {
      console.error('❌ Failed to initialize UI Controller:', error)
      throw error
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    const elementIds = [
      'credits',
      'bet',
      'winnings',
      'hands',
      'session',
      'handResult',
      'cardsContainer',
      'paytableGrid',
      'deal',
      'drawBtn',
      'betOne',
      'betMax',
      'resetBtn',
      'paytableVariation',
      'resetCredits',
      'rtpDisplay',
      'startSim',
      'stopSim',
      'simHands',
      'simSpeed',
      'simStrategy',
      'progressContainer',
      'progressFill',
      'currentHand',
      'simHandsPlayed',
      'simWagered',
      'simWon',
      'simNet',
      'simRTP',
      'simWinRate',
      'simulationGraph',
      'resultChart'
    ]

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id)
      if (!this.elements[id]) {
        console.warn(`Element with id '${id}' not found`)
      }
    })

    // Cache frequency elements
    const handTypes = [
      'royal',
      'straight-flush',
      'four-kind',
      'full-house',
      'flush',
      'straight',
      'three-kind',
      'two-pair',
      'jacks-better',
      'no-win'
    ]

    handTypes.forEach(type => {
      this.elements[`freq-${type}`] = document.getElementById(`freq-${type}`)
      this.elements[`freqp-${type}`] = document.getElementById(`freqp-${type}`)
    })
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Game controls
    this.elements.deal?.addEventListener('click', () => this.handleDeal())
    this.elements.drawBtn?.addEventListener('click', () => this.handleDraw())
    this.elements.betOne?.addEventListener('click', () => this.handleBetOne())
    this.elements.betMax?.addEventListener('click', () => this.handleBetMax())
    this.elements.resetBtn?.addEventListener('click', () => this.handleReset())

    // Card clicks for holding
    this.elements.cardsContainer?.addEventListener('click', e =>
      this.handleCardClick(e)
    )

    // Settings
    this.elements.paytableVariation?.addEventListener('change', e =>
      this.handlePaytableChange(e)
    )

    // Simulation controls
    this.elements.startSim?.addEventListener('click', () =>
      this.handleStartSimulation()
    )
    this.elements.stopSim?.addEventListener('click', () =>
      this.handleStopSimulation()
    )

    // Game engine events
    this.gameEngine.on('stateChange', state => this.updateDisplay(state))
    this.gameEngine.on('handComplete', data => this.handleHandComplete(data))
    this.gameEngine.on('error', error => this.showError(error))

    // Simulation engine events
    this.simulationEngine.on('progress', data =>
      this.updateSimulationProgress(data)
    )
    this.simulationEngine.on('complete', data =>
      this.handleSimulationComplete(data)
    )
    this.simulationEngine.on('error', error => this.showError(error))
  }

  /**
   * Handle deal button click
   */
  async handleDeal() {
    try {
      // Deal with current bet if in ready/finished state
      const currentState = this.gameEngine.getState()

      if (
        currentState.gamePhase === 'ready' ||
        currentState.gamePhase === 'finished'
      ) {
        await this.gameEngine.deal()
      }
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Handle draw button click
   */
  async handleDraw() {
    try {
      // Animate cards being replaced before drawing
      await this.animateCardReplacement()
      await this.gameEngine.draw()
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Animate card replacement during draw phase
   */
  async animateCardReplacement() {
    const cards = this.elements.cardsContainer?.querySelectorAll('.card')
    if (!cards) return

    const gameState = this.gameEngine.getState()
    const heldCards = gameState.heldCards || new Set()

    // Add replacing animation to non-held cards
    cards.forEach((cardEl, index) => {
      if (!heldCards.has(index)) {
        cardEl.classList.add('replacing')
      }
    })

    // Wait for flip animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))

    // Remove replacing class and prepare for reveal
    cards.forEach((cardEl, index) => {
      if (!heldCards.has(index)) {
        cardEl.classList.remove('replacing')
      }
    })
  }

  /**
   * Handle bet one button click
   */
  async handleBetOne() {
    try {
      // Increase bet by one, then deal if in ready/finished state
      const betChanged = this.gameEngine.betOne()
      const currentState = this.gameEngine.getState()

      if (
        currentState.gamePhase === 'ready' ||
        currentState.gamePhase === 'finished'
      ) {
        await this.gameEngine.deal()
      }
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Handle bet max button click
   */
  async handleBetMax() {
    try {
      // Set bet to max, then deal if in ready/finished state
      this.gameEngine.setBet(5)
      const currentState = this.gameEngine.getState()

      if (
        currentState.gamePhase === 'ready' ||
        currentState.gamePhase === 'finished'
      ) {
        await this.gameEngine.deal()
      }
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Handle reset button click
   */
  handleReset() {
    const newCredits = parseInt(this.elements.resetCredits?.value || '5000')
    this.gameEngine.resetCredits(newCredits)
  }

  /**
   * Handle card click for holding
   */
  handleCardClick(event) {
    const card = event.target.closest('.card')
    if (!card) return

    const index = parseInt(card.dataset.index)
    if (isNaN(index)) return

    this.gameEngine.toggleHold(index)
  }

  /**
   * Handle paytable variation change
   */
  handlePaytableChange(event) {
    const paytableId = event.target.value
    try {
      this.paytableManager.setPaytable(paytableId)
      this.buildPaytable()
      this.updateRTPDisplay()
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Handle start simulation
   */
  async handleStartSimulation() {
    try {
      const options = {
        totalHands: parseInt(this.elements.simHands?.value || '10000'),
        speed: parseInt(this.elements.simSpeed?.value || '1'),
        strategy: this.elements.simStrategy?.value || 'optimal'
      }

      this.isSimulationRunning = true
      this.updateSimulationControls()
      this.elements.progressContainer?.classList.add('active')
      if (this.elements.simulationGraph) {
        this.elements.simulationGraph.style.display = 'none'
      }

      await this.simulationEngine.startSimulation(options)
    } catch (error) {
      this.showError(error.message)
      this.isSimulationRunning = false
      this.updateSimulationControls()
    }
  }

  /**
   * Handle stop simulation
   */
  handleStopSimulation() {
    this.simulationEngine.stopSimulation()
    this.isSimulationRunning = false
    this.updateSimulationControls()
  }

  /**
   * Update main display
   */
  updateDisplay(state = null) {
    const gameState = state || this.gameEngine.getState()

    // Update credit displays
    if (this.elements.credits)
      this.elements.credits.textContent = gameState.credits
    if (this.elements.bet) this.elements.bet.textContent = gameState.bet
    if (this.elements.winnings)
      this.elements.winnings.textContent = gameState.currentWin
    if (this.elements.hands)
      this.elements.hands.textContent = gameState.handsPlayed

    // Update session display
    this.updateSessionDisplay(gameState)

    // Update hand result
    if (this.elements.handResult) {
      this.elements.handResult.textContent =
        gameState.phaseText || 'Press DEAL to start'
    }

    // Update button states
    this.updateButtonStates(gameState)

    // Render cards
    this.renderCards(gameState)
  }

  /**
   * Update session display with color coding
   */
  updateSessionDisplay(gameState) {
    if (!this.elements.session) return

    const sessionNet =
      gameState.sessionNet || gameState.credits - gameState.startingCredits

    if (sessionNet > 0) {
      this.elements.session.textContent = `+${sessionNet}`
      this.elements.session.style.color = '#4ecdc4'
    } else if (sessionNet < 0) {
      this.elements.session.textContent = `${sessionNet}`
      this.elements.session.style.color = '#e74c3c'
    } else {
      this.elements.session.textContent = '0'
      this.elements.session.style.color = '#4ecdc4'
    }
  }

  /**
   * Update button states based on game phase
   */
  updateButtonStates(gameState) {
    const isHolding = gameState.gamePhase === 'holding'
    const canAffordBet = gameState.canAffordBet !== false
    const canDeal = !isHolding && canAffordBet

    // All three betting/dealing buttons should have same state
    if (this.elements.deal) {
      this.elements.deal.disabled = !canDeal
    }

    if (this.elements.betOne) {
      this.elements.betOne.disabled = !canDeal
    }

    if (this.elements.betMax) {
      this.elements.betMax.disabled = !canDeal
    }

    if (this.elements.drawBtn) {
      this.elements.drawBtn.disabled = !isHolding
    }
  }

  /**
   * Render cards on screen
   */
  renderCards(gameState) {
    const cards = this.elements.cardsContainer?.querySelectorAll('.card')
    if (!cards) return

    cards.forEach((cardEl, index) => {
      const card = gameState.currentHand?.[index]

      if (
        card &&
        (gameState.gamePhase === 'holding' ||
          gameState.gamePhase === 'finished')
      ) {
        // Show card face
        cardEl.className = 'card'
        if (card.isRed()) {
          cardEl.classList.add('red')
        }
        if (
          gameState.heldCards?.has(index) &&
          gameState.gamePhase === 'holding'
        ) {
          cardEl.classList.add('held')
        }

        // Add new-card animation for cards that were just replaced
        if (
          gameState.gamePhase === 'finished' &&
          gameState.newCards?.has(index)
        ) {
          cardEl.classList.add('new-card')
          // Remove the animation class after animation completes
          setTimeout(() => {
            cardEl.classList.remove('new-card')
          }, 800)
        }

        cardEl.innerHTML = `
          <div class="hold-indicator">HELD</div>
          <div class="card-value">${card.rank}</div>
          <div class="card-suit">${card.suit}</div>
          <div class="card-value" style="transform: rotate(180deg);">${card.rank}</div>
        `
      } else {
        // Show card back
        cardEl.className = 'card card-back'
        cardEl.innerHTML = '<div class="hold-indicator">HELD</div>'
      }
    })
  }

  /**
   * Handle hand completion
   */
  handleHandComplete(data) {
    const { handResult, payout, bet } = data
    const netWin = payout - bet

    if (payout > 0) {
      if (this.elements.handResult) {
        // Show both total payout and net win for clarity
        this.elements.handResult.textContent = `${handResult.description} - WIN ${payout} CREDITS! (Net: ${netWin >= 0 ? '+' : ''}${netWin})`
        this.elements.handResult.style.color = '#4ecdc4'
      }
      this.highlightPaytable(handResult.category)
    } else {
      if (this.elements.handResult) {
        this.elements.handResult.textContent = `${handResult.description} - No Win`
        this.elements.handResult.style.color = '#ff6b6b'
      }
    }

    // Clear highlights after delay
    setTimeout(() => {
      this.clearPaytableHighlights()
    }, 3000)
  }

  /**
   * Build paytable display
   */
  buildPaytable() {
    if (!this.elements.paytableGrid) return

    // Clear existing content except headers
    const headers =
      this.elements.paytableGrid.querySelectorAll('.paytable-header')
    this.elements.paytableGrid.innerHTML = ''
    headers.forEach(header => this.elements.paytableGrid.appendChild(header))

    const paytableData = this.paytableManager.getPaytableForDisplay()

    paytableData.hands.forEach(hand => {
      const handEl = document.createElement('div')
      handEl.className = 'paytable-row paytable-hand'
      handEl.textContent = hand.name
      this.elements.paytableGrid.appendChild(handEl)

      hand.payouts.forEach(payout => {
        const payoutEl = document.createElement('div')
        payoutEl.className = 'paytable-row'
        payoutEl.textContent = payout
        this.elements.paytableGrid.appendChild(payoutEl)
      })
    })

    this.updateRTPDisplay()
  }

  /**
   * Update RTP display
   */
  updateRTPDisplay() {
    if (this.elements.rtpDisplay) {
      const rtp = this.paytableManager.calculateTheoreticalRTP()
      this.elements.rtpDisplay.textContent = `Current RTP: ${rtp.toFixed(2)}%`
    }
  }

  /**
   * Highlight winning paytable row
   */
  highlightPaytable(category) {
    const rows = this.elements.paytableGrid?.querySelectorAll('.paytable-row')
    if (!rows) return

    rows.forEach(row => {
      if (row.textContent.trim() === category) {
        let currentRow = row
        currentRow.classList.add('winning')
        for (let i = 0; i < 5; i++) {
          currentRow = currentRow.nextElementSibling
          if (currentRow) currentRow.classList.add('winning')
        }
      }
    })
  }

  /**
   * Clear paytable highlights
   */
  clearPaytableHighlights() {
    this.elements.paytableGrid
      ?.querySelectorAll('.winning')
      .forEach(row => row.classList.remove('winning'))
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error('Game Error:', message)

    // You could implement a toast notification system here
    if (this.elements.handResult) {
      this.elements.handResult.textContent = `Error: ${message}`
      this.elements.handResult.style.color = '#e74c3c'
    }
  }

  /**
   * Update simulation controls
   */
  updateSimulationControls() {
    if (this.elements.startSim) {
      this.elements.startSim.disabled = this.isSimulationRunning
    }
    if (this.elements.stopSim) {
      this.elements.stopSim.disabled = !this.isSimulationRunning
    }
  }

  /**
   * Update simulation progress
   */
  updateSimulationProgress(data) {
    // Update progress bar
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${data.progress.toFixed(1)}%`
      this.elements.progressFill.textContent = `${data.progress.toFixed(1)}%`
    }

    // Update current hand display
    if (this.elements.currentHand && data.latestHand) {
      this.elements.currentHand.innerHTML = `
        <div style="color: #f39c12; font-weight: bold; font-size: 1.2em;">
          🎰 SIMULATION RUNNING! 🎰<br>
          Hand ${data.handsPlayed.toLocaleString()} of ${data.totalHands.toLocaleString()}
        </div>
        <div style="margin-top: 5px; font-size: 0.9em;">
          Latest: ${data.latestHand.finalHand.join(' ')}<br>
          Result: ${data.latestHand.handResult.description} ${data.latestHand.payout > 0 ? `(+${data.latestHand.payout})` : '(0)'}
        </div>
      `
    }

    // Update statistics
    this.updateSimulationStats(data.currentStats)
  }

  /**
   * Update simulation statistics display
   */
  updateSimulationStats(stats) {
    const summary = {
      handsPlayed: stats.handsPlayed.toLocaleString(),
      totalWagered: stats.totalWagered.toLocaleString(),
      totalWon: stats.totalWon.toLocaleString(),
      net: (stats.net >= 0 ? '+' : '') + stats.net.toLocaleString(),
      rtp: stats.rtp.toFixed(2) + '%',
      winRate: stats.winRate.toFixed(1) + '%'
    }

    // Update stat displays
    if (this.elements.simHandsPlayed)
      this.elements.simHandsPlayed.textContent = summary.handsPlayed
    if (this.elements.simWagered)
      this.elements.simWagered.textContent = summary.totalWagered
    if (this.elements.simWon)
      this.elements.simWon.textContent = summary.totalWon
    if (this.elements.simNet) this.elements.simNet.textContent = summary.net
    if (this.elements.simRTP) this.elements.simRTP.textContent = summary.rtp
    if (this.elements.simWinRate)
      this.elements.simWinRate.textContent = summary.winRate

    // Update frequency table
    this.updateFrequencyTable(stats.handFrequencies)
  }

  /**
   * Update hand frequency table
   */
  updateFrequencyTable(frequencies) {
    const handTypeMap = {
      'Royal Flush': 'royal',
      'Straight Flush': 'straight-flush',
      'Four of a Kind': 'four-kind',
      'Full House': 'full-house',
      Flush: 'flush',
      Straight: 'straight',
      'Three of a Kind': 'three-kind',
      'Two Pair': 'two-pair',
      'Jacks or Better': 'jacks-better',
      'High Card': 'no-win'
    }

    Object.entries(handTypeMap).forEach(([handType, id]) => {
      const freq = frequencies[handType] || { count: 0, frequency: 0 }

      const countEl = this.elements[`freq-${id}`]
      const freqEl = this.elements[`freqp-${id}`]

      if (countEl) countEl.textContent = freq.count.toLocaleString()
      if (freqEl) freqEl.textContent = freq.frequency.toFixed(2) + '%'
    })
  }

  /**
   * Handle simulation completion
   */
  handleSimulationComplete(data) {
    this.isSimulationRunning = false
    this.updateSimulationControls()

    // Show final results
    if (this.elements.currentHand) {
      this.elements.currentHand.innerHTML = `
        <div style="color: #4ecdc4; font-weight: bold; font-size: 1.2em;">
          ✅ SIMULATION COMPLETE! ✅
        </div>
        <div style="margin-top: 10px; line-height: 1.4;">
          <strong>Final Results:</strong><br>
          • Hands Played: ${data.handsPlayed.toLocaleString()}<br>
          • Total Wagered: ${data.totalWagered.toLocaleString()}<br>
          • Total Won: ${data.totalWon.toLocaleString()}<br>
          • Net Result: ${data.net >= 0 ? '+' : ''}${data.net.toLocaleString()}<br>
          • Actual RTP: ${data.rtp.toFixed(2)}%<br>
          • Win Rate: ${data.winRate.toFixed(1)}%<br>
          • Duration: ${(data.duration / 1000).toFixed(1)}s
        </div>
      `
    }

    // Show and render the results graph
    if (this.elements.simulationGraph) {
      this.elements.simulationGraph.style.display = 'block'
      console.log(
        '📊 Simulation complete, rendering graph with data:',
        data.graphData
      )
      this.renderResultsGraph(data.graphData)
    } else {
      console.warn('⚠️ simulationGraph element not found')
    }
  }

  /**
   * Render simulation results graph
   */
  renderResultsGraph(graphData) {
    console.log(
      '📈 Rendering results graph with',
      graphData?.length || 0,
      'data points'
    )
    console.log('📈 Graph data sample:', graphData?.slice(0, 3))

    const canvas = this.elements.resultChart
    if (!canvas) {
      console.warn('❌ Cannot render graph: canvas element not found')
      return
    }

    if (!graphData || graphData.length === 0) {
      console.warn('❌ Cannot render graph: no data provided')
      return
    }

    console.log('✅ Canvas found, proceeding with graph rendering...')

    const ctx = canvas.getContext('2d')

    // Set canvas size for crisp rendering
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    const width = rect.width
    const height = rect.height
    const padding = 60
    const graphWidth = width - padding * 2
    const graphHeight = height - padding * 2

    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)'
    ctx.fillRect(0, 0, width, height)

    if (graphData.length === 0) return

    // Find min/max for scaling
    const maxHands = Math.max(...graphData.map(d => d.hand))
    const netValues = graphData.map(d => d.net)
    const minNet = Math.min(0, ...netValues)
    const maxNet = Math.max(0, ...netValues)
    const netRange = maxNet - minNet || 1

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * graphWidth) / 10
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i * graphHeight) / 10
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw baseline (zero line)
    const zeroY =
      padding + graphHeight - ((0 - minNet) / netRange) * graphHeight
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, zeroY)
    ctx.lineTo(width - padding, zeroY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw the net result line
    const finalNet = graphData[graphData.length - 1].net
    ctx.strokeStyle = finalNet >= 0 ? '#4ecdc4' : '#e74c3c'
    ctx.lineWidth = 3
    ctx.beginPath()

    graphData.forEach((point, index) => {
      const x = padding + (point.hand / maxHands) * graphWidth
      const y =
        padding + graphHeight - ((point.net - minNet) / netRange) * graphHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Add gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(
      0,
      finalNet >= 0 ? 'rgba(78, 205, 196, 0.3)' : 'rgba(231, 76, 60, 0.3)'
    )
    gradient.addColorStop(1, 'rgba(78, 205, 196, 0.05)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(padding, zeroY)
    graphData.forEach(point => {
      const x = padding + (point.hand / maxHands) * graphWidth
      const y =
        padding + graphHeight - ((point.net - minNet) / netRange) * graphHeight
      ctx.lineTo(x, y)
    })
    ctx.lineTo(width - padding, zeroY)
    ctx.closePath()
    ctx.fill()

    // Draw axes labels
    ctx.fillStyle = '#fff'
    ctx.font = '12px Orbitron'
    ctx.textAlign = 'center'

    // X-axis labels (hands)
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i * graphWidth) / 5
      const hands = Math.round((i * maxHands) / 5)
      ctx.fillText(hands.toLocaleString(), x, height - padding + 20)
    }

    // Y-axis labels (net credits)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const y = padding + graphHeight - (i * graphHeight) / 5
      const netValue = Math.round(minNet + (i * netRange) / 5)
      ctx.fillText(
        netValue >= 0 ? `+${netValue}` : netValue.toString(),
        padding - 10,
        y + 4
      )
    }

    // Axis titles
    ctx.fillStyle = '#f39c12'
    ctx.font = 'bold 14px Orbitron'
    ctx.textAlign = 'center'
    ctx.fillText('Hands Played', width / 2, height - 10)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Net Credits', 0, 0)
    ctx.restore()

    // Final result indicator
    const finalX = padding + graphWidth
    const finalY =
      padding + graphHeight - ((finalNet - minNet) / netRange) * graphHeight

    ctx.fillStyle = finalNet >= 0 ? '#4ecdc4' : '#e74c3c'
    ctx.beginPath()
    ctx.arc(finalX, finalY, 6, 0, 2 * Math.PI)
    ctx.fill()

    // Final value label
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px Orbitron'
    ctx.textAlign = 'left'
    ctx.fillText(
      `Final: ${finalNet >= 0 ? '+' : ''}${finalNet}`,
      finalX + 10,
      finalY + 4
    )
  }
}
