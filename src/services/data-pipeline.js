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
    if (cached) {
      console.log('[DataPipeline] Returning SQLite cached data for:', cacheKey);
      return cached;
    }

    console.log('[DataPipeline] Generating fresh analytical pipeline for:', homeTeam, 'vs', awayTeam);

    // 2. Build or Fetch Statistics (Form, H2H, Standings, Squad News)
    const stats = this.generateFixtureStats(homeTeam, awayTeam, league);

    // 3. Compute Prediction Engine Model Output
    const prediction = predictionEngine.predict(
      homeTeam,
      awayTeam,
      stats.h2h,
      stats.homeForm,
      stats.awayForm,
      odds || stats.odds
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
    db.saveFixtureAnalytics(cacheKey, fullAnalytics);

    return fullAnalytics;
  }

  /**
   * Helper to derive realistic stats & form data based on team names
   */
  generateFixtureStats(homeTeam, awayTeam, league) {
    // Generate deterministic hash from team names for realistic consistency
    const hash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const homeHash = hash(homeTeam);
    const awayHash = hash(awayTeam);

    // Generate Form (Last 5 matches)
    const resultsPool = ['W', 'W', 'D', 'W', 'L', 'W', 'D', 'L', 'W', 'W'];
    const generateMatches = (teamName, teamHash) => {
      const matches = [];
      let pts = 0;
      for (let i = 0; i < 5; i++) {
        const res = resultsPool[(teamHash + i) % resultsPool.length];
        const teamScore = res === 'W' ? 2 + (i % 2) : res === 'D' ? 1 : 0;
        const oppScore = res === 'W' ? 0 + (i % 2) : res === 'D' ? 1 : 2 + (i % 2);
        pts += res === 'W' ? 3 : res === 'D' ? 1 : 0;

        matches.push({
          id: i + 1,
          result: res, // 'W', 'D', 'L'
          opponent: `Opponent ${i + 1}`,
          teamScore,
          oppScore,
          score: `${teamScore}-${oppScore}`,
          isHome: i % 2 === 0
        });
      }
      return { matches, pts };
    };

    const homeForm = generateMatches(homeTeam, homeHash);
    const awayForm = generateMatches(awayTeam, awayHash);

    // Generate H2H History (Last 5 meetings)
    const h2h = [
      { date: '2025-11-12', homeScore: 2, awayScore: 1, winner: 'home', venue: `${homeTeam} Stadium` },
      { date: '2025-04-20', homeScore: 1, awayScore: 1, winner: 'draw', venue: `${awayTeam} Arena` },
      { date: '2024-12-05', homeScore: 3, awayScore: 0, winner: 'home', venue: `${homeTeam} Stadium` },
      { date: '2024-03-15', homeScore: 0, awayScore: 2, winner: 'away', venue: `${awayTeam} Arena` },
      { date: '2023-10-28', homeScore: 2, awayScore: 2, winner: 'draw', venue: `${homeTeam} Stadium` }
    ];

    // Standings
    const homeRank = (homeHash % 8) + 1;
    const awayRank = (awayHash % 12) + 3;

    const standings = {
      home: { rank: homeRank, points: 65 - homeRank * 3, played: 28, won: 18 - homeRank, drawn: 5, lost: 5 + homeRank, gf: 54, ga: 26 },
      away: { rank: awayRank, points: 58 - awayRank * 3, played: 28, won: 15 - awayRank, drawn: 6, lost: 7 + awayRank, gf: 44, ga: 32 }
    };

    // Home / Away Splits
    const homeAwaySplits = {
      homeTeamHomeRecord: { won: 10, drawn: 2, lost: 2, goalsFor: 30, goalsAgainst: 11 },
      awayTeamAwayRecord: { won: 6, drawn: 4, lost: 4, goalsFor: 21, goalsAgainst: 18 }
    };

    // Squad & Injury News
    const squadNews = {
      home: [
        { player: 'Key Striker', status: 'Fit', note: 'Scored 4 goals in last 3 games' },
        { player: 'Starting CB', status: 'Doubtful', note: 'Knock sustained in training' }
      ],
      away: [
        { player: 'Midfield Playmaker', status: 'Suspended', note: 'Accumulated yellow cards' },
        { player: 'Winger', status: 'Injured', note: 'Hamstring strain (Out 2 wks)' }
      ]
    };

    // Default Bookmaker Odds
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
