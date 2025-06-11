/**
 * Game state management
 */
export class GameState {
  constructor() {
    this.reset()
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.credits = 5000
    this.startingCredits = 5000
    this.bet = 5
    this.currentWin = 0
    this.handsPlayed = 0
    this.currentHand = []
    this.heldCards = new Set()
    this.newCards = new Set() // Track which cards were replaced in the draw
    this.gamePhase = 'ready' // 'ready', 'holding', 'finished'
  }

  /**
   * Get session net result
   */
  getSessionNet() {
    return this.credits - this.startingCredits
  }

  /**
   * Check if player can afford current bet
   */
  canAffordBet() {
    return this.credits >= this.bet
  }

  /**
   * Get held card indices as array
   */
  getHeldCards() {
    return Array.from(this.heldCards)
  }

  /**
   * Check if card is held
   */
  isCardHeld(index) {
    return this.heldCards.has(index)
  }

  /**
   * Get game phase display text
   */
  getPhaseText() {
    switch (this.gamePhase) {
      case 'ready':
        return 'Choose your bet and deal'
      case 'holding':
        return 'Select cards to hold, then press DRAW'
      case 'finished':
        return 'Hand complete - Choose bet and deal again'
      default:
        return 'Unknown state'
    }
  }

  /**
   * Validate state consistency
   */
  validate() {
    const errors = []

    if (this.credits < 0) {
      errors.push('Credits cannot be negative')
    }

    if (this.bet < 1 || this.bet > 5) {
      errors.push('Bet must be between 1 and 5')
    }

    if (this.currentHand.length > 0 && this.currentHand.length !== 5) {
      errors.push('Hand must have exactly 5 cards when dealt')
    }

    if (this.heldCards.size > 5) {
      errors.push('Cannot hold more than 5 cards')
    }

    for (const index of this.heldCards) {
      if (index < 0 || index >= 5) {
        errors.push(`Invalid held card index: ${index}`)
      }
    }

    if (!['ready', 'holding', 'finished'].includes(this.gamePhase)) {
      errors.push(`Invalid game phase: ${this.gamePhase}`)
    }

    return errors
  }

  /**
   * Create a deep copy of the state
   */
  clone() {
    const clone = new GameState()
    clone.credits = this.credits
    clone.startingCredits = this.startingCredits
    clone.bet = this.bet
    clone.currentWin = this.currentWin
    clone.handsPlayed = this.handsPlayed
    clone.currentHand = [...this.currentHand]
    clone.heldCards = new Set(this.heldCards)
    clone.newCards = new Set(this.newCards)
    clone.gamePhase = this.gamePhase
    return clone
  }

  /**
   * Export state as plain object
   */
  toObject() {
    return {
      credits: this.credits,
      startingCredits: this.startingCredits,
      bet: this.bet,
      currentWin: this.currentWin,
      handsPlayed: this.handsPlayed,
      sessionNet: this.getSessionNet(),
      currentHand: [...this.currentHand],
      heldCards: this.heldCards,
      newCards: this.newCards,
      gamePhase: this.gamePhase,
      phaseText: this.getPhaseText(),
      canAffordBet: this.canAffordBet()
    }
  }

  /**
   * Import state from plain object
   */
  fromObject(obj) {
    this.credits = obj.credits || 5000
    this.startingCredits = obj.startingCredits || 5000
    this.bet = obj.bet || 5
    this.currentWin = obj.currentWin || 0
    this.handsPlayed = obj.handsPlayed || 0
    this.gamePhase = obj.gamePhase || 'ready'

    if (obj.heldCards) {
      this.heldCards = new Set(obj.heldCards)
    }

    if (obj.newCards) {
      this.newCards = new Set(obj.newCards)
    }

    // Note: currentHand would need to be reconstructed from Card objects
    // This is typically handled by the GameEngine
  }
}
