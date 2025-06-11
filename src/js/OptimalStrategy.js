import { HandEvaluator } from './HandEvaluator.js'

/**
 * Optimal strategy calculator for Jacks or Better video poker
 */
export class OptimalStrategy {
  constructor() {
    this.handEvaluator = new HandEvaluator()
  }

  /**
   * Get optimal holds for a given hand
   */
  getOptimalHolds(hand) {
    if (!hand || hand.length !== 5) {
      throw new Error('Hand must contain exactly 5 cards')
    }

    // Analyze the hand
    const analysis = this.analyzeHand(hand)
    
    // Apply strategy rules in priority order
    return this.applyStrategyRules(hand, analysis)
  }

  /**
   * Analyze hand for patterns
   */
  analyzeHand(hand) {
    const ranks = hand.map(card => card.getValue())
    const suits = hand.map(card => card.suit)
    
    // Count ranks and suits
    const rankCounts = {}
    const suitCounts = {}
    
    ranks.forEach(rank => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1
    })
    
    suits.forEach(suit => {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1
    })
    
    // Find pairs, trips, quads
    const pairs = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 2)
    const trips = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 3)
    const quads = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 4)
    
    // Check for flush and straight possibilities
    const isFlush = Object.values(suitCounts).some(count => count >= 5)
    const isStraight = this.isStraight(ranks)
    const isRoyalStraight = this.isRoyalStraight(ranks)
    
    // Check for high cards (J, Q, K, A)
    const highCards = []
    hand.forEach((card, index) => {
      if (card.getValue() === 1 || card.getValue() >= 11) {
        highCards.push(index)
      }
    })
    
    return {
      rankCounts,
      suitCounts,
      pairs: pairs.map(r => parseInt(r)),
      trips: trips.map(r => parseInt(r)),
      quads: quads.map(r => parseInt(r)),
      isFlush,
      isStraight,
      isRoyalStraight,
      highCards,
      flushSuit: Object.keys(suitCounts).find(suit => suitCounts[suit] >= 4),
      straightGaps: this.analyzeStraightPossibilities(ranks)
    }
  }

  /**
   * Apply strategy rules in priority order
   */
  applyStrategyRules(hand, analysis) {
    const holds = new Set()

    // Rule 1: Made hands (keep everything)
    if (analysis.quads.length > 0) {
      // Four of a kind - keep all four
      const quadRank = analysis.quads[0]
      hand.forEach((card, i) => {
        if (card.getValue() === quadRank) holds.add(i)
      })
      return holds
    }

    if (analysis.trips.length > 0 && analysis.pairs.length > 0) {
      // Full house - keep everything
      return new Set([0, 1, 2, 3, 4])
    }

    if (analysis.isFlush) {
      // Flush - keep everything
      return new Set([0, 1, 2, 3, 4])
    }

    if (analysis.isStraight) {
      // Straight - keep everything
      return new Set([0, 1, 2, 3, 4])
    }

    // Rule 2: Three of a kind
    if (analysis.trips.length > 0) {
      const tripRank = analysis.trips[0]
      hand.forEach((card, i) => {
        if (card.getValue() === tripRank) holds.add(i)
      })
      return holds
    }

    // Rule 3: High pairs (Jacks or better)
    const highPairs = analysis.pairs.filter(rank => rank === 1 || rank >= 11)
    if (highPairs.length > 0) {
      const pairRank = highPairs[0]
      hand.forEach((card, i) => {
        if (card.getValue() === pairRank) holds.add(i)
      })
      return holds
    }

    // Rule 4: Four to a royal flush
    const royalFlushDraw = this.checkRoyalFlushDraw(hand)
    if (royalFlushDraw.length === 4) {
      royalFlushDraw.forEach(i => holds.add(i))
      return holds
    }

    // Rule 5: Four to a straight flush
    const straightFlushDraw = this.checkStraightFlushDraw(hand)
    if (straightFlushDraw.length === 4) {
      straightFlushDraw.forEach(i => holds.add(i))
      return holds
    }

    // Rule 6: Low pairs
    const lowPairs = analysis.pairs.filter(rank => rank !== 1 && rank < 11)
    if (lowPairs.length > 0) {
      const pairRank = lowPairs[0]
      hand.forEach((card, i) => {
        if (card.getValue() === pairRank) holds.add(i)
      })
      return holds
    }

    // Rule 7: Four to a flush
    if (analysis.flushSuit) {
      hand.forEach((card, i) => {
        if (card.suit === analysis.flushSuit) holds.add(i)
      })
      if (holds.size === 4) return holds
      holds.clear()
    }

    // Rule 8: Three to a royal flush
    const royalFlushDraw3 = this.checkRoyalFlushDraw(hand)
    if (royalFlushDraw3.length === 3) {
      royalFlushDraw3.forEach(i => holds.add(i))
      return holds
    }

    // Rule 9: Four to an outside straight
    const outsideStraightDraw = this.checkOutsideStraightDraw(hand)
    if (outsideStraightDraw.length === 4) {
      outsideStraightDraw.forEach(i => holds.add(i))
      return holds
    }

    // Rule 10: High cards (up to 3)
    if (analysis.highCards.length > 0) {
      // Prefer suited high cards
      const suitedHighCards = this.findSuitedHighCards(hand, analysis.highCards)
      if (suitedHighCards.length >= 2) {
        suitedHighCards.slice(0, 3).forEach(i => holds.add(i))
        return holds
      }
      
      // Otherwise, keep up to 3 high cards
      analysis.highCards.slice(0, 3).forEach(i => holds.add(i))
      return holds
    }

    // Rule 11: Three to a straight flush
    const straightFlushDraw3 = this.checkStraightFlushDraw(hand)
    if (straightFlushDraw3.length === 3) {
      straightFlushDraw3.forEach(i => holds.add(i))
      return holds
    }

    // Default: Hold nothing (draw 5 new cards)
    return holds
  }

  /**
   * Check for royal flush draw
   */
  checkRoyalFlushDraw(hand) {
    const royalRanks = new Set([1, 10, 11, 12, 13])
    const suitGroups = {}
    
    hand.forEach((card, index) => {
      if (royalRanks.has(card.getValue())) {
        if (!suitGroups[card.suit]) {
          suitGroups[card.suit] = []
        }
        suitGroups[card.suit].push(index)
      }
    })
    
    // Find the suit with the most royal cards
    let bestDraw = []
    for (const indices of Object.values(suitGroups)) {
      if (indices.length > bestDraw.length) {
        bestDraw = indices
      }
    }
    
    return bestDraw
  }

  /**
   * Check for straight flush draw
   */
  checkStraightFlushDraw(hand) {
    // This is a simplified version - a full implementation would be more complex
    const suitGroups = {}
    
    hand.forEach((card, index) => {
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = []
      }
      suitGroups[card.suit].push({ index, rank: card.getValue() })
    })
    
    for (const group of Object.values(suitGroups)) {
      if (group.length >= 3) {
        const ranks = group.map(g => g.rank).sort((a, b) => a - b)
        if (this.hasSequentialPotential(ranks)) {
          return group.map(g => g.index)
        }
      }
    }
    
    return []
  }

  /**
   * Check for outside straight draw
   */
  checkOutsideStraightDraw(hand) {
    const ranks = hand.map(card => card.getValue()).sort((a, b) => a - b)
    const uniqueRanks = [...new Set(ranks)]
    
    // Check for 4-card outside straight possibilities
    if (uniqueRanks.length >= 4) {
      // This is simplified - full implementation would check all possibilities
      for (let i = 0; i <= uniqueRanks.length - 4; i++) {
        const sequence = uniqueRanks.slice(i, i + 4)
        if (sequence[3] - sequence[0] === 3) {
          // Found 4-card outside straight
          const indices = []
          hand.forEach((card, index) => {
            if (sequence.includes(card.getValue())) {
              indices.push(index)
            }
          })
          return indices.slice(0, 4)
        }
      }
    }
    
    return []
  }

  /**
   * Find suited high cards
   */
  findSuitedHighCards(hand, highCardIndices) {
    const suitGroups = {}
    
    highCardIndices.forEach(index => {
      const card = hand[index]
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = []
      }
      suitGroups[card.suit].push(index)
    })
    
    // Return the largest group of suited high cards
    let bestGroup = []
    for (const group of Object.values(suitGroups)) {
      if (group.length > bestGroup.length) {
        bestGroup = group
      }
    }
    
    return bestGroup
  }

  /**
   * Helper methods
   */
  isStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b)
    if (uniqueRanks.length !== 5) return false
    
    return uniqueRanks[4] - uniqueRanks[0] === 4 ||
           uniqueRanks.join(',') === '1,2,3,4,5' ||
           uniqueRanks.join(',') === '1,10,11,12,13'
  }

  isRoyalStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b)
    return uniqueRanks.join(',') === '1,10,11,12,13'
  }

  analyzeStraightPossibilities(ranks) {
    // Simplified analysis
    return []
  }

  hasSequentialPotential(ranks) {
    // Check if ranks have potential for straight
    if (ranks.length < 3) return false
    
    for (let i = 0; i < ranks.length - 2; i++) {
      if (ranks[i + 2] - ranks[i] <= 4) {
        return true
      }
    }
    
    return false
  }
}
