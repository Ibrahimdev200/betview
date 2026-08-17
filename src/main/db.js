const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class BetLensDB {
  constructor() {
    this.dbPath = null;
    this.fixturesCache = new Map();
    this.bookedBets = [];
  }

  init() {
    try {
      const userDataDir = app ? app.getPath('userData') : process.cwd();
      this.dbPath = path.join(userDataDir, 'betlens_db.json');

      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.fixtures) {
          Object.entries(data.fixtures).forEach(([k, v]) => this.fixturesCache.set(k, v));
        }
        if (Array.isArray(data.bookedBets)) {
          this.bookedBets = data.bookedBets;
        }
      } else {
        this.save();
      }
      console.log('[BetLens DB] SQLite/Persistent storage initialized at:', this.dbPath);
    } catch (err) {
      console.error('[BetLens DB] Error initializing storage:', err);
    }
  }

  save() {
    try {
      if (!this.dbPath) return;
      const data = {
        fixtures: Object.fromEntries(this.fixturesCache),
        bookedBets: this.bookedBets,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[BetLens DB] Error saving data:', err);
    }
  }

  getFixtureAnalytics(cacheKey) {
    const cached = this.fixturesCache.get(cacheKey);
    if (!cached) return null;

    // Cache valid for 6 hours
    const age = Date.now() - (cached.cachedAt || 0);
    if (age > 6 * 60 * 60 * 1000) {
      this.fixturesCache.delete(cacheKey);
      this.save();
      return null;
    }
    return cached.data;
  }

  saveFixtureAnalytics(cacheKey, data) {
    this.fixturesCache.set(cacheKey, {
      cachedAt: Date.now(),
      data
    });
    this.save();
  }

  addBookedBet(bet) {
    // Check if code already exists in top 10
    const exists = this.bookedBets.find(b => b.code === bet.code);
    if (!exists) {
      const betRecord = {
        id: 'bet_' + Date.now(),
        code: bet.code,
        stake: bet.stake || '1,000.00',
        bookmaker: bet.bookmaker || 'Sportsbook',
        timestamp: bet.timestamp || new Date().toISOString()
      };
      this.bookedBets.unshift(betRecord);
      // Keep last 100 bets
      if (this.bookedBets.length > 100) {
        this.bookedBets = this.bookedBets.slice(0, 100);
      }
      this.save();
      return betRecord;
    }
    return exists;
  }

  getBookedBets() {
    return this.bookedBets;
  }
}

module.exports = new BetLensDB();
