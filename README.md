# Video Poker Simulator

A professional-grade video poker simulator featuring Jacks or Better gameplay with optimal strategy analysis, comprehensive statistics, and high-performance simulation capabilities.

## 🎰 Features

### Core Gameplay
- **Authentic Jacks or Better Video Poker** - Full implementation with proper hand evaluation
- **Multiple Paytable Variations** - Full Pay (99.54% RTP), Short Pay (98.39% RTP), and Bonus Poker (99.17% RTP)
- **Interactive Card Holding** - Click cards to hold/release before drawing
- **Real-time Statistics** - Track credits, hands played, session results

### Advanced Simulation
- **High-Performance Simulation Engine** - Simulate up to 100,000 hands
- **Optimal Strategy Implementation** - Based on mathematically correct Jacks or Better strategy
- **Real-time Progress Tracking** - Live updates during simulation
- **Comprehensive Statistics** - Hand frequencies, RTP analysis, volatility metrics
- **Visual Results Graphing** - Net result tracking over time

### Professional Features
- **Modular Architecture** - Clean separation of concerns with ES6 modules
- **Comprehensive Testing** - Unit tests with Vitest framework
- **Modern Development Tools** - Vite build system, ESLint, Prettier
- **Responsive Design** - Works on desktop and mobile devices
- **Performance Optimized** - Efficient algorithms and memory management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn 1.22+

### Installation

```bash
# Clone the repository
git clone https://github.com/cschweda/video-poker-simulator.git
cd video-poker-simulator

# Install dependencies
yarn install

# Start development server
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build for production
yarn build

# Preview production build
yarn preview

# Serve production build
yarn serve
```

## 🎮 How to Play

1. **Set Your Bet** - Use BET ONE to increase bet (1-5 credits) or BET MAX to bet 5 and deal
2. **Deal Cards** - Click DEAL to receive your initial 5-card hand
3. **Hold Cards** - Click on cards you want to keep (they'll highlight in gold)
4. **Draw** - Click DRAW to replace non-held cards
5. **Collect Winnings** - Winning hands are automatically paid according to the paytable

### Winning Hands (Jacks or Better)
- **Royal Flush** - A, K, Q, J, 10 all same suit
- **Straight Flush** - Five consecutive cards, same suit
- **Four of a Kind** - Four cards of same rank
- **Full House** - Three of a kind plus a pair
- **Flush** - Five cards of same suit
- **Straight** - Five consecutive cards
- **Three of a Kind** - Three cards of same rank
- **Two Pair** - Two separate pairs
- **Jacks or Better** - Pair of Jacks, Queens, Kings, or Aces

## 🧪 Simulation Mode

The simulator includes a powerful simulation engine for strategy analysis:

### Features
- **Strategy Comparison** - Test optimal vs. random play
- **Configurable Parameters** - Adjust number of hands and simulation speed
- **Real-time Statistics** - Live RTP, hand frequencies, and net results
- **Visual Analytics** - Graph showing performance over time
- **Export Results** - Save simulation data for analysis

### Using the Simulator
1. Set number of hands (100 - 100,000)
2. Choose simulation speed (1-1000ms per hand)
3. Select strategy (Optimal or Random)
4. Click START SIMULATION
5. Monitor real-time progress and statistics

## 🏗️ Architecture

### Project Structure
```
src/
├── js/                 # Core game logic
│   ├── Card.js         # Card and Deck classes
│   ├── GameEngine.js   # Main game logic
│   ├── GameState.js    # State management
│   ├── HandEvaluator.js # Poker hand evaluation
│   ├── OptimalStrategy.js # Optimal play strategy
│   ├── PaytableManager.js # Paytable management
│   ├── SimulationEngine.js # High-performance simulation
│   ├── SimulationStats.js # Statistics tracking
│   └── UIController.js # User interface management
├── styles/
│   └── main.css        # Styling and animations
├── test/               # Unit tests
└── main.js            # Application entry point
```

### Key Components

#### GameEngine
- Manages game state and flow
- Handles dealing, holding, and drawing
- Integrates with paytable and hand evaluation

#### SimulationEngine  
- High-performance hand simulation
- Strategy implementation
- Real-time progress tracking

#### HandEvaluator
- Accurate poker hand evaluation
- Supports all standard poker hands
- Optimized for performance

#### OptimalStrategy
- Mathematically correct Jacks or Better strategy
- Considers all draw possibilities
- Maximizes expected value

## 🧪 Testing

The project includes comprehensive unit tests:

```bash
# Run all tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

### Test Coverage
- Card and Deck functionality
- Hand evaluation accuracy
- Game state management
- Paytable calculations
- Strategy implementation

## 🛠️ Development

### Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run unit tests
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

### Code Quality
- **ESLint** - Code linting and style enforcement
- **Prettier** - Automatic code formatting
- **Vitest** - Fast unit testing framework
- **TypeScript** - Type checking (optional)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📊 Performance

### Simulation Performance
- **Speed** - Up to 10,000+ hands per second
- **Memory** - Efficient memory usage with data sampling
- **Accuracy** - Mathematically precise calculations
- **Scalability** - Handles large simulation runs

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 Strategy & Mathematics

### Optimal Strategy
The simulator implements the mathematically optimal strategy for Jacks or Better:

1. **Made Hands** - Always hold paying hands
2. **Drawing Hands** - Prioritize high-value draws
3. **High Cards** - Hold Jacks or better
4. **Suited Connectors** - Consider straight/flush potential

### Expected Return
- **Full Pay** - 99.54% RTP with optimal play
- **Short Pay** - 98.39% RTP with optimal play  
- **Bonus Poker** - 99.17% RTP with optimal play

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Email: cschweda@gmail.com
- Review the documentation and tests

## 🎯 Future Enhancements

- Additional poker variations (Deuces Wild, Bonus Poker Deluxe)
- Advanced strategy trainer mode
- Tournament simulation
- Progressive jackpot simulation
- Mobile app version
- Multiplayer features
