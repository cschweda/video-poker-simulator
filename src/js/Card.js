/**
 * Playing card representation
 */
export class Card {
  static SUITS = ['♠', '♥', '♦', '♣']
  static RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  static RANK_VALUES = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  }

  constructor(rank, suit) {
    if (!Card.RANKS.includes(rank)) {
      throw new Error(`Invalid rank: ${rank}`)
    }
    if (!Card.SUITS.includes(suit)) {
      throw new Error(`Invalid suit: ${suit}`)
    }
    
    this.rank = rank
    this.suit = suit
  }

  /**
   * Get numeric value of the card
   */
  getValue() {
    return Card.RANK_VALUES[this.rank]
  }

  /**
   * Check if card is red
   */
  isRed() {
    return this.suit === '♥' || this.suit === '♦'
  }

  /**
   * Check if card is black
   */
  isBlack() {
    return this.suit === '♠' || this.suit === '♣'
  }

  /**
   * String representation
   */
  toString() {
    return `${this.rank}${this.suit}`
  }

  /**
   * Check equality with another card
   */
  equals(other) {
    return this.rank === other.rank && this.suit === other.suit
  }

  /**
   * Create card from string representation
   */
  static fromString(str) {
    if (str.length < 2) {
      throw new Error(`Invalid card string: ${str}`)
    }
    
    const suit = str.slice(-1)
    const rank = str.slice(0, -1)
    
    return new Card(rank, suit)
  }
}

/**
 * Standard 52-card deck
 */
export class Deck {
  constructor() {
    this.cards = []
    this.reset()
  }

  /**
   * Reset deck to full 52 cards
   */
  reset() {
    this.cards = []
    for (const suit of Card.SUITS) {
      for (const rank of Card.RANKS) {
        this.cards.push(new Card(rank, suit))
      }
    }
    return this
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
    return this
  }

  /**
   * Deal one card from the top
   */
  deal() {
    if (this.cards.length === 0) {
      throw new Error('Cannot deal from empty deck')
    }
    return this.cards.pop()
  }

  /**
   * Deal multiple cards
   */
  dealHand(count = 5) {
    const hand = []
    for (let i = 0; i < count; i++) {
      hand.push(this.deal())
    }
    return hand
  }

  /**
   * Get number of remaining cards
   */
  size() {
    return this.cards.length
  }

  /**
   * Check if deck is empty
   */
  isEmpty() {
    return this.cards.length === 0
  }

  /**
   * Peek at top card without dealing
   */
  peek() {
    if (this.cards.length === 0) {
      return null
    }
    return this.cards[this.cards.length - 1]
  }

  /**
   * Get all cards (for testing)
   */
  getCards() {
    return [...this.cards]
  }
}
