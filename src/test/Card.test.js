import { describe, it, expect } from 'vitest'
import { Card, Deck } from '../js/Card.js'

describe('Card', () => {
  it('should create a valid card', () => {
    const card = new Card('A', '♠')
    expect(card.rank).toBe('A')
    expect(card.suit).toBe('♠')
    expect(card.getValue()).toBe(1)
  })

  it('should identify red cards correctly', () => {
    const redCard = new Card('K', '♥')
    const blackCard = new Card('K', '♠')
    
    expect(redCard.isRed()).toBe(true)
    expect(redCard.isBlack()).toBe(false)
    expect(blackCard.isRed()).toBe(false)
    expect(blackCard.isBlack()).toBe(true)
  })

  it('should convert to string correctly', () => {
    const card = new Card('10', '♦')
    expect(card.toString()).toBe('10♦')
  })

  it('should create card from string', () => {
    const card = Card.fromString('Q♣')
    expect(card.rank).toBe('Q')
    expect(card.suit).toBe('♣')
    expect(card.getValue()).toBe(12)
  })

  it('should throw error for invalid rank', () => {
    expect(() => new Card('X', '♠')).toThrow('Invalid rank: X')
  })

  it('should throw error for invalid suit', () => {
    expect(() => new Card('A', '♡')).toThrow('Invalid suit: ♡')
  })

  it('should check equality correctly', () => {
    const card1 = new Card('A', '♠')
    const card2 = new Card('A', '♠')
    const card3 = new Card('A', '♥')
    
    expect(card1.equals(card2)).toBe(true)
    expect(card1.equals(card3)).toBe(false)
  })
})

describe('Deck', () => {
  it('should create a full 52-card deck', () => {
    const deck = new Deck()
    expect(deck.size()).toBe(52)
  })

  it('should deal cards correctly', () => {
    const deck = new Deck()
    const card = deck.deal()
    
    expect(card).toBeInstanceOf(Card)
    expect(deck.size()).toBe(51)
  })

  it('should deal a hand of 5 cards', () => {
    const deck = new Deck()
    const hand = deck.dealHand(5)
    
    expect(hand).toHaveLength(5)
    expect(deck.size()).toBe(47)
    hand.forEach(card => expect(card).toBeInstanceOf(Card))
  })

  it('should shuffle the deck', () => {
    const deck1 = new Deck()
    const deck2 = new Deck()
    
    const cards1 = deck1.getCards().map(c => c.toString())
    deck2.shuffle()
    const cards2 = deck2.getCards().map(c => c.toString())
    
    // Very unlikely to be the same after shuffle
    expect(cards1).not.toEqual(cards2)
  })

  it('should reset to full deck', () => {
    const deck = new Deck()
    deck.deal()
    deck.deal()
    deck.deal()
    
    expect(deck.size()).toBe(49)
    
    deck.reset()
    expect(deck.size()).toBe(52)
  })

  it('should throw error when dealing from empty deck', () => {
    const deck = new Deck()
    
    // Deal all cards
    for (let i = 0; i < 52; i++) {
      deck.deal()
    }
    
    expect(() => deck.deal()).toThrow('Cannot deal from empty deck')
  })

  it('should peek at top card without dealing', () => {
    const deck = new Deck()
    const topCard = deck.peek()
    const dealtCard = deck.deal()
    
    expect(topCard.equals(dealtCard)).toBe(true)
  })

  it('should return null when peeking at empty deck', () => {
    const deck = new Deck()
    
    // Deal all cards
    for (let i = 0; i < 52; i++) {
      deck.deal()
    }
    
    expect(deck.peek()).toBeNull()
  })

  it('should check if deck is empty', () => {
    const deck = new Deck()
    expect(deck.isEmpty()).toBe(false)
    
    // Deal all cards
    for (let i = 0; i < 52; i++) {
      deck.deal()
    }
    
    expect(deck.isEmpty()).toBe(true)
  })
})
