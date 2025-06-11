/**
 * Manages paytables for different video poker variations
 */
export class PaytableManager {
  constructor() {
    this.currentPaytable = 'full'
    this.paytables = this.initializePaytables()
  }

  /**
   * Initialize all paytable variations
   */
  initializePaytables() {
    return {
      full: {
        name: 'Full Pay Jacks or Better',
        rtp: 99.54,
        description: 'The best paying Jacks or Better variation',
        payouts: {
          'Royal Flush': [250, 500, 750, 1000, 4000],
          'Straight Flush': [50, 100, 150, 200, 250],
          'Four of a Kind': [25, 50, 75, 100, 125],
          'Full House': [9, 18, 27, 36, 45],
          Flush: [6, 12, 18, 24, 30],
          Straight: [4, 8, 12, 16, 20],
          'Three of a Kind': [3, 6, 9, 12, 15],
          'Two Pair': [2, 4, 6, 8, 10],
          'Jacks or Better': [1, 2, 3, 4, 5]
        }
      },
      short: {
        name: 'Short Pay Jacks or Better',
        rtp: 98.39,
        description: 'Reduced payouts on Full House and Flush',
        payouts: {
          'Royal Flush': [250, 500, 750, 1000, 4000],
          'Straight Flush': [50, 100, 150, 200, 250],
          'Four of a Kind': [25, 50, 75, 100, 125],
          'Full House': [8, 16, 24, 32, 40],
          Flush: [5, 10, 15, 20, 25],
          Straight: [4, 8, 12, 16, 20],
          'Three of a Kind': [3, 6, 9, 12, 15],
          'Two Pair': [2, 4, 6, 8, 10],
          'Jacks or Better': [1, 2, 3, 4, 5]
        }
      },
      bonus: {
        name: 'Bonus Poker',
        rtp: 99.17,
        description: 'Enhanced payouts for Four of a Kind',
        payouts: {
          'Royal Flush': [250, 500, 750, 1000, 4000],
          'Straight Flush': [50, 100, 150, 200, 250],
          'Four of a Kind': [80, 160, 240, 320, 400], // Enhanced
          'Full House': [8, 16, 24, 32, 40],
          Flush: [5, 10, 15, 20, 25],
          Straight: [4, 8, 12, 16, 20],
          'Three of a Kind': [3, 6, 9, 12, 15],
          'Two Pair': [2, 4, 6, 8, 10],
          'Jacks or Better': [1, 2, 3, 4, 5]
        }
      }
    }
  }

  /**
   * Get current paytable
   */
  getCurrentPaytable() {
    return this.paytables[this.currentPaytable]
  }

  /**
   * Set current paytable
   */
  setPaytable(paytableId) {
    if (!this.paytables[paytableId]) {
      throw new Error(`Unknown paytable: ${paytableId}`)
    }
    this.currentPaytable = paytableId
    return this.getCurrentPaytable()
  }

  /**
   * Calculate payout for a hand category and bet amount
   * Returns total credits to be awarded
   *
   * Standard video poker: paytable shows total payout amounts
   * - 1:1 payout = 1x bet total (you get your bet back)
   * - 2:1 payout = 2x bet total (you get your bet back + 1x bet in winnings)
   */
  calculatePayout(category, bet) {
    const paytable = this.getCurrentPaytable()
    const payouts = paytable.payouts[category]

    if (!payouts) {
      return 0 // No payout for this category
    }

    if (bet < 1 || bet > 5) {
      throw new Error(`Invalid bet amount: ${bet}`)
    }

    // Paytable values show total payout amounts
    // For Jacks or Better (1:1): paytable shows [1, 2, 3, 4, 5] = 1x bet
    // For Two Pair (2:1): paytable shows [2, 4, 6, 8, 10] = 2x bet
    const totalPayout = payouts[bet - 1] || 0
    return totalPayout
  }

  /**
   * Get all available paytables
   */
  getAvailablePaytables() {
    return Object.keys(this.paytables).map(id => ({
      id,
      name: this.paytables[id].name,
      rtp: this.paytables[id].rtp,
      description: this.paytables[id].description
    }))
  }

  /**
   * Get paytable for display
   */
  getPaytableForDisplay() {
    const paytable = this.getCurrentPaytable()
    const hands = Object.keys(paytable.payouts)

    return {
      name: paytable.name,
      rtp: paytable.rtp,
      hands: hands.map(hand => ({
        name: hand,
        payouts: paytable.payouts[hand]
      }))
    }
  }

  /**
   * Calculate theoretical RTP for optimal play
   */
  calculateTheoreticalRTP() {
    // This would require complex probability calculations
    // For now, return the stored RTP value
    return this.getCurrentPaytable().rtp
  }

  /**
   * Get expected value for a bet amount
   */
  getExpectedValue(bet) {
    const rtp = this.calculateTheoreticalRTP()
    return (bet * rtp) / 100
  }

  /**
   * Validate paytable structure
   */
  validatePaytable(paytable) {
    const errors = []

    if (!paytable.name) {
      errors.push('Paytable must have a name')
    }

    if (!paytable.rtp || paytable.rtp < 0 || paytable.rtp > 100) {
      errors.push('Paytable must have valid RTP (0-100)')
    }

    if (!paytable.payouts) {
      errors.push('Paytable must have payouts object')
    } else {
      const requiredHands = [
        'Royal Flush',
        'Straight Flush',
        'Four of a Kind',
        'Full House',
        'Flush',
        'Straight',
        'Three of a Kind',
        'Two Pair',
        'Jacks or Better'
      ]

      for (const hand of requiredHands) {
        if (!paytable.payouts[hand]) {
          errors.push(`Missing payout for ${hand}`)
        } else if (
          !Array.isArray(paytable.payouts[hand]) ||
          paytable.payouts[hand].length !== 5
        ) {
          errors.push(`${hand} must have exactly 5 payout values`)
        }
      }
    }

    return errors
  }

  /**
   * Add custom paytable
   */
  addCustomPaytable(id, paytable) {
    const errors = this.validatePaytable(paytable)
    if (errors.length > 0) {
      throw new Error(`Invalid paytable: ${errors.join(', ')}`)
    }

    this.paytables[id] = paytable
    return true
  }

  /**
   * Export paytables for saving
   */
  exportPaytables() {
    return JSON.stringify(this.paytables, null, 2)
  }

  /**
   * Import paytables from JSON
   */
  importPaytables(jsonString) {
    try {
      const imported = JSON.parse(jsonString)

      // Validate each paytable
      for (const [id, paytable] of Object.entries(imported)) {
        const errors = this.validatePaytable(paytable)
        if (errors.length > 0) {
          throw new Error(`Invalid paytable ${id}: ${errors.join(', ')}`)
        }
      }

      this.paytables = { ...this.paytables, ...imported }
      return true
    } catch (error) {
      throw new Error(`Failed to import paytables: ${error.message}`)
    }
  }
}
