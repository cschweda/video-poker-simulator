import { Card } from './Card.js'

/**
 * Poker hand evaluation engine
 */
export class HandEvaluator {
  /**
   * Evaluate a 5-card poker hand
   */
  evaluate(hand) {
    if (!hand || hand.length !== 5) {
      throw new Error('Hand must contain exactly 5 cards')
    }

    const ranks = hand.map(card => card.getValue())
    const suits = hand.map(card => card.suit)
    
    // Count ranks and suits
    const rankCounts = this.countRanks(ranks)
    const suitCounts = this.countSuits(suits)
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a)
    const isFlush = Object.values(suitCounts).some(count => count >= 5)
    const isStraight = this.isStraight(ranks)
    const isRoyal = this.isRoyalStraight(ranks)

    // Determine hand type
    if (isRoyal && isFlush) {
      return { category: 'Royal Flush', description: 'Royal Flush', rank: 10 }
    }
    
    if (isStraight && isFlush) {
      return { category: 'Straight Flush', description: 'Straight Flush', rank: 9 }
    }
    
    if (counts[0] === 4) {
      return { category: 'Four of a Kind', description: 'Four of a Kind', rank: 8 }
    }
    
    if (counts[0] === 3 && counts[1] === 2) {
      return { category: 'Full House', description: 'Full House', rank: 7 }
    }
    
    if (isFlush) {
      return { category: 'Flush', description: 'Flush', rank: 6 }
    }
    
    if (isStraight) {
      return { category: 'Straight', description: 'Straight', rank: 5 }
    }
    
    if (counts[0] === 3) {
      return { category: 'Three of a Kind', description: 'Three of a Kind', rank: 4 }
    }
    
    if (counts[0] === 2 && counts[1] === 2) {
      return { category: 'Two Pair', description: 'Two Pair', rank: 3 }
    }
    
    if (counts[0] === 2) {
      const pairRank = this.getPairRank(rankCounts)
      if (pairRank === 1 || pairRank >= 11) { // Aces or Jacks+
        const pairName = this.getRankName(pairRank)
        return { 
          category: 'Jacks or Better', 
          description: `Pair of ${pairName}`, 
          rank: 2 
        }
      }
      return { category: 'Low Pair', description: 'Low Pair', rank: 1 }
    }
    
    return { category: 'High Card', description: 'High Card', rank: 0 }
  }

  /**
   * Count occurrences of each rank
   */
  countRanks(ranks) {
    const counts = {}
    ranks.forEach(rank => {
      counts[rank] = (counts[rank] || 0) + 1
    })
    return counts
  }

  /**
   * Count occurrences of each suit
   */
  countSuits(suits) {
    const counts = {}
    suits.forEach(suit => {
      counts[suit] = (counts[suit] || 0) + 1
    })
    return counts
  }

  /**
   * Check if hand is a straight
   */
  isStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b)
    
    if (uniqueRanks.length !== 5) {
      return false
    }
    
    // Regular straight
    if (uniqueRanks[4] - uniqueRanks[0] === 4) {
      return true
    }
    
    // A-2-3-4-5 straight (wheel)
    if (uniqueRanks.join(',') === '1,2,3,4,5') {
      return true
    }
    
    // 10-J-Q-K-A straight (broadway)
    if (uniqueRanks.join(',') === '1,10,11,12,13') {
      return true
    }
    
    return false
  }

  /**
   * Check if hand is a royal straight (10-J-Q-K-A)
   */
  isRoyalStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b)
    return uniqueRanks.join(',') === '1,10,11,12,13'
  }

  /**
   * Get the rank of the pair in a pair hand
   */
  getPairRank(rankCounts) {
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count === 2) {
        return parseInt(rank)
      }
    }
    return null
  }

  /**
   * Get human-readable name for a rank
   */
  getRankName(rank) {
    const names = {
      1: 'Aces',
      11: 'Jacks',
      12: 'Queens',
      13: 'Kings'
    }
    return names[rank] || `${rank}s`
  }

  /**
   * Compare two hands (returns -1, 0, or 1)
   */
  compareHands(hand1, hand2) {
    const result1 = this.evaluate(hand1)
    const result2 = this.evaluate(hand2)
    
    if (result1.rank > result2.rank) return 1
    if (result1.rank < result2.rank) return -1
    
    // Same hand type - would need more detailed comparison for poker
    // For video poker, this is sufficient
    return 0
  }

  /**
   * Get all possible hand categories in order of strength
   */
  static getHandCategories() {
    return [
      'High Card',
      'Low Pair', 
      'Jacks or Better',
      'Two Pair',
      'Three of a Kind',
      'Straight',
      'Flush',
      'Full House',
      'Four of a Kind',
      'Straight Flush',
      'Royal Flush'
    ]
  }

  /**
   * Get paying hand categories for Jacks or Better
   */
  static getPayingCategories() {
    return [
      'Jacks or Better',
      'Two Pair',
      'Three of a Kind',
      'Straight',
      'Flush',
      'Full House',
      'Four of a Kind',
      'Straight Flush',
      'Royal Flush'
    ]
  }
}
