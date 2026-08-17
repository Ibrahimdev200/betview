# BetLens — Desktop Analytics Browser for Sports Betting

**BetLens** is an Electron-based desktop browser designed for analyzing sports betting fixtures in real-time. It embeds sportsbooks (such as SportyBet and Bet9ja) within an isolated, persistent `<webview>` while providing a real-time analytics sidebar, Poisson statistical predictions, and automated bet booking code capture.

---

## ✨ Features

- **Persistent Session & Login**: Retains login cookies and local storage across app restarts using Electron's `persist:betlens_session` partition.
- **Real-Time DOM Detection**: Preload scraper detects clicks on matches/fixtures to fetch analytics instantly without disrupting browsing.
- **Poisson Prediction Engine**: Calculates expected goals ($xG$), Win/Draw/Away probabilities, top predicted scorelines, and confidence scores.
- **Collapsible Analytics Sidebar**: Dark-themed dashboard with H2H history, recent 5-match W/D/L form badges, league standings, and squad injury news.
- **"Last Booked Bet" Widget & History**: Automatically detects generated booking codes upon placing a bet, copies the code to the clipboard, and saves a log to local SQLite storage.
- **Data Pipeline & SQLite Caching**: Caches fixture data locally to optimize speed and eliminate API rate limit issues.

---

## 🛠️ Architecture & Stack

- **Desktop Shell**: Electron + Vite + React
- **Styling**: Tailwind CSS + Glassmorphism Dark Tokens
- **Icons**: Lucide React
- **Storage**: SQLite / Persistent JSON store
- **Scraper**: Electron Webview Preload Script + ContextBridge IPC

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ibrahimdev200/betview.git
   cd betview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build renderer assets:
   ```bash
   npm run build
   ```

4. Launch BetLens:
   ```bash
   npm start
   ```

---

## 📄 License

MIT License © 2026 BetLens Team
