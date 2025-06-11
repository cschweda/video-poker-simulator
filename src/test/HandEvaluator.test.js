import { describe, it, expect } from 'vitest'
import { HandEvaluator } from '../js/HandEvaluator.js'
import { Card } from '../js/Card.js'

describe('HandEvaluator', () => {
  const evaluator = new HandEvaluator()

  const createHand = (cardStrings) => {
    return cardStrings.map(str => Card.fromString(str))
  }

  it('should identify Royal Flush', () => {
    const hand = createHand(['A♠', 'K♠', 'Q♠', 'J♠', '10♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Royal Flush')
    expect(result.rank).toBe(10)
  })

  it('should identify Straight Flush', () => {
    const hand = createHand(['9♠', '8♠', '7♠', '6♠', '5♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Straight Flush')
    expect(result.rank).toBe(9)
  })

  it('should identify Four of a Kind', () => {
    const hand = createHand(['A♠', 'A♥', 'A♦', 'A♣', '5♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Four of a Kind')
    expect(result.rank).toBe(8)
  })

  it('should identify Full House', () => {
    const hand = createHand(['K♠', 'K♥', 'K♦', '5♣', '5♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Full House')
    expect(result.rank).toBe(7)
  })

  it('should identify Flush', () => {
    const hand = createHand(['A♠', 'J♠', '9♠', '7♠', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Flush')
    expect(result.rank).toBe(6)
  })

  it('should identify Straight', () => {
    const hand = createHand(['A♠', '2♥', '3♦', '4♣', '5♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Straight')
    expect(result.rank).toBe(5)
  })

  it('should identify Broadway Straight', () => {
    const hand = createHand(['A♠', 'K♥', 'Q♦', 'J♣', '10♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Straight')
    expect(result.rank).toBe(5)
  })

  it('should identify Three of a Kind', () => {
    const hand = createHand(['Q♠', 'Q♥', 'Q♦', '7♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Three of a Kind')
    expect(result.rank).toBe(4)
  })

  it('should identify Two Pair', () => {
    const hand = createHand(['K♠', 'K♥', '7♦', '7♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Two Pair')
    expect(result.rank).toBe(3)
  })

  it('should identify Jacks or Better', () => {
    const hand = createHand(['J♠', 'J♥', '7♦', '4♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Jacks or Better')
    expect(result.description).toBe('Pair of Jacks')
    expect(result.rank).toBe(2)
  })

  it('should identify Pair of Aces as Jacks or Better', () => {
    const hand = createHand(['A♠', 'A♥', '7♦', '4♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Jacks or Better')
    expect(result.description).toBe('Pair of Aces')
    expect(result.rank).toBe(2)
  })

  it('should identify Low Pair', () => {
    const hand = createHand(['9♠', '9♥', '7♦', '4♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('Low Pair')
    expect(result.rank).toBe(1)
  })

  it('should identify High Card', () => {
    const hand = createHand(['K♠', 'J♥', '9♦', '7♣', '3♠'])
    const result = evaluator.evaluate(hand)
    
    expect(result.category).toBe('High Card')
    expect(result.rank).toBe(0)
  })

  it('should throw error for invalid hand size', () => {
    const hand = createHand(['A♠', 'K♥'])
    
    expect(() => evaluator.evaluate(hand)).toThrow('Hand must contain exactly 5 cards')
  })

  it('should compare hands correctly', () => {
    const royalFlush = createHand(['A♠', 'K♠', 'Q♠', 'J♠', '10♠'])
    const straightFlush = createHand(['9♠', '8♠', '7♠', '6♠', '5♠'])
    const fourOfAKind = createHand(['A♠', 'A♥', 'A♦', 'A♣', '5♠'])
    
    expect(evaluator.compareHands(royalFlush, straightFlush)).toBe(1)
    expect(evaluator.compareHands(straightFlush, fourOfAKind)).toBe(1)
    expect(evaluator.compareHands(fourOfAKind, royalFlush)).toBe(-1)
  })

  it('should get hand categories', () => {
    const categories = HandEvaluator.getHandCategories()
    expect(categories).toContain('Royal Flush')
    expect(categories).toContain('High Card')
    expect(categories[categories.length - 1]).toBe('Royal Flush')
  })

  it('should get paying categories', () => {
    const payingCategories = HandEvaluator.getPayingCategories()
    expect(payingCategories).toContain('Royal Flush')
    expect(payingCategories).toContain('Jacks or Better')
    expect(payingCategories).not.toContain('High Card')
    expect(payingCategories).not.toContain('Low Pair')
  })
})
