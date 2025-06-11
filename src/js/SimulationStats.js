/**
 * Statistics tracking for simulation results
 */
export class SimulationStats {
  constructor() {
    this.reset()
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.handsPlayed = 0
    this.totalHands = 0
    this.totalWagered = 0
    this.totalWon = 0
    this.winningHands = 0
    
    // Hand frequency tracking
    this.handCounts = {
      'Royal Flush': 0,
      'Straight Flush': 0,
      'Four of a Kind': 0,
      'Full House': 0,
      'Flush': 0,
      'Straight': 0,
      'Three of a Kind': 0,
      'Two Pair': 0,
      'Jacks or Better': 0,
      'Low Pair': 0,
      'High Card': 0
    }
    
    // Net result tracking for graphing
    this.netHistory = [0]
    this.graphData = []
    
    // Performance tracking
    this.startTime = null
    this.endTime = null
  }

  /**
   * Set total hands for progress tracking
   */
  setTotalHands(total) {
    this.totalHands = total
  }

  /**
   * Add a completed hand to statistics
   */
  addHand(handResult) {
    this.handsPlayed++
    this.totalWagered += handResult.bet
    this.totalWon += handResult.payout
    
    if (handResult.payout > 0) {
      this.winningHands++
    }
    
    // Track hand frequency
    const category = handResult.handResult.category
    if (this.handCounts.hasOwnProperty(category)) {
      this.handCounts[category]++
    } else {
      // Map non-paying hands to 'High Card'
      this.handCounts['High Card']++
    }
    
    // Track net result for graphing
    const currentNet = this.totalWon - this.totalWagered
    this.netHistory.push(currentNet)
    
    // Sample data points for graph (to prevent memory issues)
    const sampleRate = Math.max(1, Math.floor(this.totalHands / 500))
    if (this.handsPlayed % sampleRate === 0 || this.handsPlayed === this.totalHands) {
      this.graphData.push({
        hand: this.handsPlayed,
        net: currentNet,
        rtp: this.getRTP()
      })
    }
  }

  /**
   * Get current statistics
   */
  getCurrentStats() {
    const net = this.totalWon - this.totalWagered
    const rtp = this.getRTP()
    const winRate = this.getWinRate()
    
    return {
      handsPlayed: this.handsPlayed,
      totalWagered: this.totalWagered,
      totalWon: this.totalWon,
      net,
      rtp,
      winRate,
      winningHands: this.winningHands,
      handFrequencies: this.getHandFrequencies(),
      progress: this.getProgress()
    }
  }

  /**
   * Get final results
   */
  getFinalResults() {
    this.endTime = Date.now()
    
    return {
      ...this.getCurrentStats(),
      graphData: this.graphData,
      netHistory: this.netHistory,
      duration: this.endTime - this.startTime,
      handsPerSecond: this.getHandsPerSecond()
    }
  }

  /**
   * Get return to player percentage
   */
  getRTP() {
    return this.totalWagered > 0 ? (this.totalWon / this.totalWagered) * 100 : 0
  }

  /**
   * Get win rate percentage
   */
  getWinRate() {
    return this.handsPlayed > 0 ? (this.winningHands / this.handsPlayed) * 100 : 0
  }

  /**
   * Get progress percentage
   */
  getProgress() {
    return this.totalHands > 0 ? (this.handsPlayed / this.totalHands) * 100 : 0
  }

  /**
   * Get hands per second
   */
  getHandsPerSecond() {
    if (!this.startTime || !this.endTime) return 0
    const duration = (this.endTime - this.startTime) / 1000
    return duration > 0 ? this.handsPlayed / duration : 0
  }

  /**
   * Get hand frequencies with percentages
   */
  getHandFrequencies() {
    const frequencies = {}
    
    for (const [hand, count] of Object.entries(this.handCounts)) {
      frequencies[hand] = {
        count,
        frequency: this.handsPlayed > 0 ? (count / this.handsPlayed) * 100 : 0
      }
    }
    
    return frequencies
  }

  /**
   * Get theoretical vs actual comparison
   */
  getTheoreticalComparison() {
    // Theoretical frequencies for Jacks or Better (approximate)
    const theoretical = {
      'Royal Flush': 0.000025,
      'Straight Flush': 0.000014,
      'Four of a Kind': 0.000236,
      'Full House': 0.001151,
      'Flush': 0.001101,
      'Straight': 0.003925,
      'Three of a Kind': 0.074449,
      'Two Pair': 0.129279,
      'Jacks or Better': 0.214585,
      'Low Pair': 0.258446,
      'High Card': 0.317789
    }
    
    const comparison = {}
    const frequencies = this.getHandFrequencies()
    
    for (const [hand, theoreticalFreq] of Object.entries(theoretical)) {
      const actualFreq = frequencies[hand] ? frequencies[hand].frequency / 100 : 0
      comparison[hand] = {
        theoretical: theoreticalFreq * 100,
        actual: actualFreq * 100,
        difference: (actualFreq - theoreticalFreq) * 100,
        ratio: theoreticalFreq > 0 ? actualFreq / theoreticalFreq : 0
      }
    }
    
    return comparison
  }

  /**
   * Get volatility metrics
   */
  getVolatilityMetrics() {
    if (this.netHistory.length < 2) {
      return { standardDeviation: 0, variance: 0 }
    }
    
    const mean = this.netHistory.reduce((sum, val) => sum + val, 0) / this.netHistory.length
    const variance = this.netHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.netHistory.length
    const standardDeviation = Math.sqrt(variance)
    
    return { standardDeviation, variance, mean }
  }

  /**
   * Get confidence intervals
   */
  getConfidenceIntervals() {
    if (this.handsPlayed < 100) {
      return null
    }
    
    const rtp = this.getRTP()
    const standardError = Math.sqrt((rtp * (100 - rtp)) / this.handsPlayed)
    
    // 95% confidence interval
    const margin = 1.96 * standardError
    
    return {
      rtp: {
        lower: Math.max(0, rtp - margin),
        upper: Math.min(100, rtp + margin),
        margin
      }
    }
  }

  /**
   * Export statistics as JSON
   */
  exportStats() {
    return JSON.stringify({
      summary: this.getCurrentStats(),
      handFrequencies: this.getHandFrequencies(),
      theoreticalComparison: this.getTheoreticalComparison(),
      volatility: this.getVolatilityMetrics(),
      confidenceIntervals: this.getConfidenceIntervals(),
      graphData: this.graphData,
      timestamp: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Start timing
   */
  startTiming() {
    this.startTime = Date.now()
  }

  /**
   * Get summary for display
   */
  getSummary() {
    const stats = this.getCurrentStats()
    
    return {
      handsPlayed: stats.handsPlayed.toLocaleString(),
      totalWagered: stats.totalWagered.toLocaleString(),
      totalWon: stats.totalWon.toLocaleString(),
      net: (stats.net >= 0 ? '+' : '') + stats.net.toLocaleString(),
      rtp: stats.rtp.toFixed(2) + '%',
      winRate: stats.winRate.toFixed(1) + '%'
    }
  }
}
