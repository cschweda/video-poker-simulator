import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '../js/GameEngine.js'
import { PaytableManager } from '../js/PaytableManager.js'

describe('GameEngine', () => {
  let gameEngine
  let paytableManager

  beforeEach(() => {
    paytableManager = new PaytableManager()
    gameEngine = new GameEngine(paytableManager)
  })

  it('should initialize with correct default state', () => {
    const state = gameEngine.getState()
    
    expect(state.credits).toBe(5000)
    expect(state.bet).toBe(5)
    expect(state.gamePhase).toBe('ready')
    expect(state.handsPlayed).toBe(0)
    expect(state.heldCards).toBeInstanceOf(Set)
    expect(state.heldCards.size).toBe(0)
  })

  it('should deal a hand correctly', () => {
    const initialCredits = gameEngine.getState().credits
    gameEngine.deal()
    
    const state = gameEngine.getState()
    expect(state.credits).toBe(initialCredits - 5) // Bet deducted
    expect(state.currentHand).toHaveLength(5)
    expect(state.gamePhase).toBe('holding')
    expect(state.currentWin).toBe(0)
  })

  it('should toggle card holds correctly', () => {
    gameEngine.deal()
    
    // Hold first card
    expect(gameEngine.toggleHold(0)).toBe(true)
    expect(gameEngine.getState().heldCards.has(0)).toBe(true)
    
    // Release first card
    expect(gameEngine.toggleHold(0)).toBe(true)
    expect(gameEngine.getState().heldCards.has(0)).toBe(false)
  })

  it('should not allow holding cards when not in holding phase', () => {
    // Try to hold when in ready phase
    expect(gameEngine.toggleHold(0)).toBe(false)
  })

  it('should draw replacement cards correctly', () => {
    gameEngine.deal()
    const originalHand = [...gameEngine.getState().currentHand]
    
    // Hold first two cards
    gameEngine.toggleHold(0)
    gameEngine.toggleHold(1)
    
    const result = gameEngine.draw()
    const finalHand = gameEngine.getState().currentHand
    
    // First two cards should be the same
    expect(finalHand[0].equals(originalHand[0])).toBe(true)
    expect(finalHand[1].equals(originalHand[1])).toBe(true)
    
    // Last three cards should be different
    expect(finalHand[2].equals(originalHand[2])).toBe(false)
    expect(finalHand[3].equals(originalHand[3])).toBe(false)
    expect(finalHand[4].equals(originalHand[4])).toBe(false)
    
    expect(result.handResult).toBeDefined()
    expect(result.payout).toBeGreaterThanOrEqual(0)
    expect(gameEngine.getState().gamePhase).toBe('finished')
  })

  it('should handle bet changes correctly', () => {
    expect(gameEngine.setBet(3)).toBe(true)
    expect(gameEngine.getState().bet).toBe(3)
    
    expect(gameEngine.setBet(6)).toBe(false) // Invalid bet
    expect(gameEngine.getState().bet).toBe(3) // Should remain unchanged
  })

  it('should increase bet with betOne', () => {
    gameEngine.setBet(1)
    expect(gameEngine.betOne()).toBe(true)
    expect(gameEngine.getState().bet).toBe(2)
    
    // Should cap at 5
    gameEngine.setBet(5)
    expect(gameEngine.betOne()).toBe(false)
    expect(gameEngine.getState().bet).toBe(5)
  })

  it('should handle betMax correctly', () => {
    const result = gameEngine.betMax()
    const state = gameEngine.getState()
    
    expect(state.bet).toBe(5)
    expect(state.gamePhase).toBe('holding') // Should auto-deal
    expect(result).toBeDefined()
  })

  it('should reset credits correctly', () => {
    gameEngine.resetCredits(1000)
    const state = gameEngine.getState()
    
    expect(state.credits).toBe(1000)
    expect(state.startingCredits).toBe(1000)
    expect(state.handsPlayed).toBe(0)
    expect(state.gamePhase).toBe('ready')
  })

  it('should not allow invalid credit reset amounts', () => {
    const originalCredits = gameEngine.getState().credits
    
    expect(gameEngine.resetCredits(50)).toBe(false) // Too low
    expect(gameEngine.resetCredits(15000)).toBe(false) // Too high
    expect(gameEngine.getState().credits).toBe(originalCredits)
  })

  it('should calculate session stats correctly', () => {
    gameEngine.resetCredits(1000)
    gameEngine.deal() // Lose 5 credits
    
    const stats = gameEngine.getSessionStats()
    expect(stats.sessionNet).toBe(-5)
    expect(stats.handsPlayed).toBe(0) // Hand not completed yet
    expect(stats.startingCredits).toBe(1000)
    expect(stats.currentCredits).toBe(995)
  })

  it('should check if game can continue', () => {
    expect(gameEngine.canContinue()).toBe(true)
    
    // Set credits below bet amount
    gameEngine.gameState.credits = 3
    gameEngine.gameState.bet = 5
    expect(gameEngine.canContinue()).toBe(false)
  })

  it('should emit events correctly', () => {
    let stateChangeEmitted = false
    let handCompleteEmitted = false
    
    gameEngine.on('stateChange', () => { stateChangeEmitted = true })
    gameEngine.on('handComplete', () => { handCompleteEmitted = true })
    
    gameEngine.deal()
    expect(stateChangeEmitted).toBe(true)
    
    gameEngine.draw()
    expect(handCompleteEmitted).toBe(true)
  })
})
