import { describe, it, expect } from 'vitest'
import { PaytableManager } from '../js/PaytableManager.js'

describe('Payout Calculation (Standard Video Poker)', () => {
  let paytableManager

  beforeEach(() => {
    paytableManager = new PaytableManager()
  })

  it('should calculate correct payout for Jacks or Better with 5-credit bet', () => {
    // Jacks or Better: paytable shows [1, 2, 3, 4, 5] (total payout amounts)
    // For 5-credit bet: should get 5 total (1:1 payout)
    const payout = paytableManager.calculatePayout('Jacks or Better', 5)
    expect(payout).toBe(5) // 1:1 payout = 5 credits total
  })

  it('should calculate correct payout for Two Pair with 5-credit bet', () => {
    // Two Pair: paytable shows [2, 4, 6, 8, 10] (total payout amounts)
    // For 5-credit bet: should get 10 total (2:1 payout)
    const payout = paytableManager.calculatePayout('Two Pair', 5)
    expect(payout).toBe(10) // 2:1 payout = 10 credits total
  })

  it('should calculate correct payout for Royal Flush with 5-credit bet', () => {
    // Royal Flush: paytable shows [250, 500, 750, 1000, 4000] (total payout amounts)
    // For 5-credit bet: should get 4000 total (800:1 payout)
    const payout = paytableManager.calculatePayout('Royal Flush', 5)
    expect(payout).toBe(4000) // 800:1 payout = 4000 credits total
  })

  it('should return 0 for non-winning hands', () => {
    const payout = paytableManager.calculatePayout('High Card', 5)
    expect(payout).toBe(0) // No payout for high card
  })

  it('should calculate correct payout for different bet amounts', () => {
    // Jacks or Better with 1-credit bet: 1 total (1:1 payout)
    expect(paytableManager.calculatePayout('Jacks or Better', 1)).toBe(1)

    // Jacks or Better with 3-credit bet: 3 total (1:1 payout)
    expect(paytableManager.calculatePayout('Jacks or Better', 3)).toBe(3)
  })

  it('should handle edge cases correctly', () => {
    // Invalid category
    expect(paytableManager.calculatePayout('Invalid Hand', 5)).toBe(0)

    // Invalid bet amounts should throw
    expect(() =>
      paytableManager.calculatePayout('Jacks or Better', 0)
    ).toThrow()
    expect(() =>
      paytableManager.calculatePayout('Jacks or Better', 6)
    ).toThrow()
  })
})
