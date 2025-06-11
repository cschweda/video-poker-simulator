/**
 * Test setup file for Vitest
 */

// Mock DOM elements for testing
global.document = {
  getElementById: (id) => ({
    textContent: '',
    style: {},
    addEventListener: () => {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    innerHTML: '',
    disabled: false
  }),
  createElement: (tag) => ({
    className: '',
    textContent: '',
    style: {},
    appendChild: () => {},
    addEventListener: () => {}
  }),
  addEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null
}

global.window = {
  addEventListener: () => {}
}

// Mock console for cleaner test output
const originalConsole = global.console
global.console = {
  ...originalConsole,
  log: () => {}, // Suppress console.log in tests
  warn: originalConsole.warn,
  error: originalConsole.error
}
