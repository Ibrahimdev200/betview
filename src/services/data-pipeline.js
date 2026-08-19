const db = require('../main/db');
const predictionEngine = require('./prediction-engine');

class DataPipeline {
  /**
   * Main entry point to retrieve analytics for any fixture
   */
  async getFixtureAnalytics(homeTeam, awayTeam, league = 'Premier League', odds = null) {
    const cacheKey = `${homeTeam.toLowerCase().trim()}_vs_${awayTeam.toLowerCase().trim()}`;
    
    // 1. Check local SQLite storage cache first
    const cached = db.getFixtureAnalytics(cacheKey);
    if (cached && cached.prediction?.verdict) {
      console.log('[DataPipeline] Returning SQLite cached data for:', cacheKey);
      return cached;
    }

    console.log('[DataPipeline] Generating fresh analytical pipeline for:', homeTeam, 'vs', awayTeam);

    // 2. Build or Fetch Statistics
    const stats = this.generateFixtureStats(homeTeam, awayTeam, league);

    // 3. Compute Prediction Engine Model Output
    const prediction = predictionEngine.predict(
      homeTeam,
      awayTeam,
      stats.h2h,
      stats.homeForm,
      stats.awayForm,
      odds || stats.odds,
      stats.homeAwaySplits?.homeTeamHomeRecord,
      stats.homeAwaySplits?.awayTeamAwayRecord,
      stats.squadNews
    );

    const fullAnalytics = {
      fixture: {
        homeTeam,
        awayTeam,
        league,
        kickoffTime: new Date(Date.now() + 3600000 * 4).toISOString(),
        venue: `${homeTeam} Stadium`
      },
      odds: odds || stats.odds,
      prediction,
      h2h: stats.h2h,
      homeForm: stats.homeForm,
      awayForm: stats.awayForm,
      standings: stats.standings,
      homeAwaySplits: stats.homeAwaySplits,
      squadNews: stats.squadNews,
      generatedAt: new Date().toISOString()
    };

    // 4. Save to SQLite Cache
    try {
      db.saveFixtureAnalytics(cacheKey, fullAnalytics);
    } catch (e) {
      console.warn('[DataPipeline] Could not save to SQLite cache:', e.message);
    }

    return fullAnalytics;
  }

  generateFixtureStats(homeTeam, awayTeam, league) {
    const hash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const homeHash = hash(homeTeam);
    const awayHash = hash(awayTeam);

    const resultsPool = ['W', 'W', 'D', 'W', 'L', 'W', 'D', 'L', 'W', 'W'];
    const generateMatches = (teamHash) => {
      const matches = [];
      let won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, cs = 0, fts = 0;
      for (let i = 0; i < 5; i++) {
        const res = resultsPool[(teamHash + i) % resultsPool.length];
        const teamScore = res === 'W' ? 2 + (i % 2) : res === 'D' ? 1 : 0;
        const oppScore = res === 'W' ? 0 + (i % 2) : res === 'D' ? 1 : 2 + (i % 2);
        gf += teamScore;
        ga += oppScore;
        if (oppScore === 0) cs++;
        if (teamScore === 0) fts++;
        if (res === 'W') won++;
        else if (res === 'D') drawn++;
        else lost++;

        matches.push({
          id: i + 1,
          result: res,
          opponent: `Opponent ${i + 1}`,
          teamScore,
          oppScore,
          score: `${teamScore}-${oppScore}`,
          isHome: i % 2 === 0
        });
      }
      return {
        matches,
        played: 5,
        won,
        drawn,
        lost,
        goalsFor: gf,
        goalsAgainst: ga,
        avgGoalsFor: (gf / 5).toFixed(1),
        avgGoalsAgainst: (ga / 5).toFixed(1),
        cleanSheets: cs,
        failedToScore: fts,
        cleanSheetPct: Math.round((cs / 5) * 100),
        failedToScorePct: Math.round((fts / 5) * 100)
      };
    };

    const homeForm = generateMatches(homeHash);
    const awayForm = generateMatches(awayHash);

    const h2hMatches = [
      { date: '2025-11-12', homeScore: 2, awayScore: 1, winner: 'home', venue: `${homeTeam} Stadium` },
      { date: '2025-04-20', homeScore: 1, awayScore: 1, winner: 'draw', venue: `${awayTeam} Arena` },
      { date: '2024-12-05', homeScore: 3, awayScore: 0, winner: 'home', venue: `${homeTeam} Stadium` },
      { date: '2024-03-15', homeScore: 0, awayScore: 2, winner: 'away', venue: `${awayTeam} Arena` },
      { date: '2023-10-28', homeScore: 2, awayScore: 2, winner: 'draw', venue: `${homeTeam} Stadium` }
    ];

    const h2h = {
      sampleSize: h2hMatches.length,
      homeWins: 2,
      awayWins: 1,
      draws: 2,
      bttsCount: 4,
      over15Count: 4,
      over25Count: 3,
      avgGoals: '2.4',
      matches: h2hMatches
    };

    const homeRank = (homeHash % 8) + 1;
    const awayRank = (awayHash % 12) + 3;

    const standings = {
      home: { rank: homeRank, points: 65 - homeRank * 3, played: 28, won: 18 - homeRank, drawn: 5, lost: 5 + homeRank, gf: 54, ga: 26 },
      away: { rank: awayRank, points: 58 - awayRank * 3, played: 28, won: 15 - awayRank, drawn: 6, lost: 7 + awayRank, gf: 44, ga: 32 }
    };

    const homeAwaySplits = {
      homeTeamHomeRecord: { won: 10, drawn: 2, lost: 2, goalsFor: 30, goalsAgainst: 11 },
      awayTeamAwayRecord: { won: 6, drawn: 4, lost: 4, goalsFor: 21, goalsAgainst: 18 }
    };

    const squadNews = {
      notice: 'Player availability data is not available from the current data source.'
    };

    const odds = {
      home: parseFloat((1.65 + (homeRank * 0.1)).toFixed(2)),
      draw: 3.55,
      away: parseFloat((2.80 + (awayRank * 0.2)).toFixed(2))
    };

    return {
      h2h,
      homeForm,
      awayForm,
      standings,
      homeAwaySplits,
      squadNews,
      odds
    };
  }
}

module.exports = new DataPipeline();
