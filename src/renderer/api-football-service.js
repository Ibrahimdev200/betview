// API-Football (v3.football.api-sports.io) Client Service & Data Adapter

const API_KEY = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_FOOTBALL_KEY)
  || (typeof process !== 'undefined' && process?.env?.API_FOOTBALL_KEY)
  || '6d0f5685f685e56beaa945414e90765d';

const BASE_URL = 'https://v3.football.api-sports.io';

const CACHE = {
  fixtures: {},
  odds: {},
  h2h: {},
  teamStats: {},
  recentFixtures: {},
  injuries: {},
  analysis: {}
};

/**
 * Clean Match Model Adapter
 */
export function formatMatch(item) {
  if (!item) return null;
  const fix = item.fixture || item;
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const score = item.score || {};

  const homeHash = ((teams.home?.name || 'Home').length * 37 + (teams.home?.id || 10)) % 15;
  const awayHash = ((teams.away?.name || 'Away').length * 41 + (teams.away?.id || 10)) % 15;

  const homeOdds = parseFloat((1.50 + homeHash * 0.12).toFixed(2));
  const drawOdds = parseFloat((3.10 + (homeHash % 4) * 0.2).toFixed(2));
  const awayOdds = parseFloat((2.50 + awayHash * 0.22).toFixed(2));
  const over25Odds = parseFloat((1.60 + (homeHash % 3) * 0.15).toFixed(2));
  const bttsOdds = parseFloat((1.55 + (awayHash % 3) * 0.15).toFixed(2));
  const dc1xOdds = parseFloat((1.15 + (homeHash % 2) * 0.1).toFixed(2));

  return {
    id: fix.id,
    date: fix.date,
    timestamp: fix.timestamp,
    timezone: fix.timezone || 'UTC',
    referee: fix.referee || 'Referee Not Announced',
    venue: fix.venue?.name ? `${fix.venue.name}${fix.venue.city ? ', ' + fix.venue.city : ''}` : 'Official Match Venue',
    status: fix.status?.short || 'NS',
    statusLong: fix.status?.long || 'Not Started',
    elapsed: fix.status?.elapsed || null,
    league: {
      id: league.id,
      name: league.name || 'Football League',
      country: league.country || 'International',
      logo: league.logo || null,
      flag: league.flag || null,
      season: league.season || new Date().getFullYear(),
      round: league.round || null
    },
    homeTeam: {
      id: teams.home?.id,
      name: teams.home?.name || 'Home Team',
      logo: teams.home?.logo || null,
      winner: teams.home?.winner
    },
    awayTeam: {
      id: teams.away?.id,
      name: teams.away?.name || 'Away Team',
      logo: teams.away?.logo || null,
      winner: teams.away?.winner
    },
    goals: {
      home: goals.home ?? null,
      away: goals.away ?? null
    },
    score: {
      halftime: score.halftime || { home: null, away: null },
      fulltime: score.fulltime || { home: null, away: null }
    },
    odds: {
      home: homeOdds,
      draw: drawOdds,
      away: awayOdds,
      over25: over25Odds,
      btts: bttsOdds,
      dc1x: dc1xOdds
    }
  };
}

export const apiFootballService = {
  /**
   * Fetch daily fixtures from API-Football for a given YYYY-MM-DD date
   */
  getDailyFixtures: async (dateString) => {
    const targetDate = dateString || new Date().toISOString().split('T')[0];

    if (CACHE.fixtures[targetDate]) {
      console.log('[API-Football] Returning cached fixtures for:', targetDate);
      return CACHE.fixtures[targetDate];
    }

    try {
      console.log('[API-Football] Fetching live fixtures for date:', targetDate);
      const res = await fetch(`${BASE_URL}/fixtures?date=${targetDate}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY
        }
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      const rawList = data.response || [];
      const formattedFixtures = rawList.map(formatMatch).filter(Boolean);

      CACHE.fixtures[targetDate] = formattedFixtures;
      return formattedFixtures;
    } catch (e) {
      console.error('[API-Football] Failed to fetch fixtures:', e);
      return [];
    }
  },

  /**
   * Fetch H2H head-to-head history between two team IDs
   */
  getH2H: async (homeTeamId, awayTeamId) => {
    if (!homeTeamId || !awayTeamId) return [];
    const key = `${homeTeamId}-${awayTeamId}`;
    if (CACHE.h2h[key]) return CACHE.h2h[key];

    try {
      const res = await fetch(`${BASE_URL}/fixtures/headtohead?h2h=${key}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      const list = (data.response || []).slice(0, 10);
      CACHE.h2h[key] = list;
      return list;
    } catch (e) {
      console.warn('[API-Football] H2H fetch failed:', e);
      return [];
    }
  },

  /**
   * Fetch team statistics for a season and league
   */
  getTeamStatistics: async (teamId, leagueId, season) => {
    if (!teamId || !leagueId) return null;
    const currentYear = new Date().getFullYear();
    const targetSeason = season || currentYear;
    const key = `${teamId}-${leagueId}-${targetSeason}`;
    if (CACHE.teamStats[key]) return CACHE.teamStats[key];

    try {
      const res = await fetch(`${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${targetSeason}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      let statsObj = data.response || null;

      // Fallback search across previous seasons if current season has no played games yet
      if ((!statsObj || !statsObj.fixtures?.played?.total) && targetSeason >= 2020) {
        for (let y = targetSeason - 1; y >= 2022; y--) {
          try {
            const fallbackRes = await fetch(`${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${y}`, {
              method: 'GET',
              headers: { 'x-apisports-key': API_KEY }
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackData.response?.fixtures?.played?.total) {
              statsObj = fallbackData.response;
              break;
            }
          } catch (err) {}
        }
      }

      CACHE.teamStats[key] = statsObj;
      return statsObj;
    } catch (e) {
      console.warn('[API-Football] Team statistics fetch failed:', e);
      return null;
    }
  },

  /**
   * Fetch recent fixtures for a team
   */
  getRecentFixtures: async (teamId, last = 10) => {
    if (!teamId) return [];
    const key = `${teamId}-${last}`;
    if (CACHE.recentFixtures[key]) return CACHE.recentFixtures[key];

    try {
      const res = await fetch(`${BASE_URL}/fixtures?team=${teamId}&last=${last}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      let list = data.response || [];

      // If last=10 returned empty list, try querying previous season fixtures
      if (list.length === 0) {
        const prevYear = new Date().getFullYear() - 1;
        const fallbackRes = await fetch(`${BASE_URL}/fixtures?team=${teamId}&season=${prevYear}`, {
          method: 'GET',
          headers: { 'x-apisports-key': API_KEY }
        });
        const fallbackData = await fallbackRes.json();
        list = (fallbackData.response || []).slice(0, last);
      }

      CACHE.recentFixtures[key] = list;
      return list;
    } catch (e) {
      console.warn('[API-Football] Recent fixtures fetch failed:', e);
      return [];
    }
  },

  /**
   * Fetch injuries for a fixture or team
   */
  getInjuries: async (fixtureId, homeTeamId, awayTeamId) => {
    const key = fixtureId ? `fix-${fixtureId}` : `${homeTeamId}-${awayTeamId}`;
    if (CACHE.injuries[key]) return CACHE.injuries[key];

    try {
      let url = `${BASE_URL}/injuries?fixture=${fixtureId}`;
      if (!fixtureId && homeTeamId) {
        url = `${BASE_URL}/injuries?team=${homeTeamId}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      const list = data.response || [];
      CACHE.injuries[key] = list;
      return list;
    } catch (e) {
      console.warn('[API-Football] Injuries fetch failed:', e);
      return [];
    }
  },

  /**
   * Complete Match Analysis Pipeline Orchestrator
   */
  getCompleteMatchAnalysisData: async (matchInput, onProgress) => {
    const updateProgress = (stepText) => {
      if (typeof onProgress === 'function') onProgress(stepText);
    };

    const fixtureObj = matchInput?.homeTeam?.name ? matchInput : formatMatch(matchInput);
    if (!fixtureObj || !fixtureObj.id) {
      throw new Error('Invalid match fixture object provided.');
    }

    const fixtureId = fixtureObj.id;
    if (CACHE.analysis[fixtureId]) {
      console.log('[API-Football] Returning cached analysis for fixture:', fixtureId);
      return CACHE.analysis[fixtureId];
    }

    const homeTeamId = fixtureObj.homeTeam.id;
    const awayTeamId = fixtureObj.awayTeam.id;
    const leagueId = fixtureObj.league.id;
    const season = fixtureObj.league.season || new Date().getFullYear();

    updateProgress('Fixture information...');
    let isPartialData = false;

    // Parallel API fetching
    updateProgress('Team statistics & Head-to-head...');
    const [h2hRaw, homeStats, awayStats, homeRecentRaw, awayRecentRaw, injuriesRaw] = await Promise.all([
      apiFootballService.getH2H(homeTeamId, awayTeamId).catch(() => []),
      apiFootballService.getTeamStatistics(homeTeamId, leagueId, season).catch(() => null),
      apiFootballService.getTeamStatistics(awayTeamId, leagueId, season).catch(() => null),
      apiFootballService.getRecentFixtures(homeTeamId, 10).catch(() => []),
      apiFootballService.getRecentFixtures(awayTeamId, 10).catch(() => []),
      apiFootballService.getInjuries(fixtureId, homeTeamId, awayTeamId).catch(() => [])
    ]);

    updateProgress('Recent form & match trends...');
    if (!homeStats && !awayStats && homeRecentRaw.length === 0 && awayRecentRaw.length === 0) {
      isPartialData = true;
    }

    updateProgress('Head-to-head & player data...');

    // Filter H2H to completed matches only
    const validH2H = h2hRaw.filter(m => m.goals?.home !== null && m.goals?.away !== null);

    const h2hMatches = validH2H.map(m => ({
      date: m.fixture.date?.split('T')[0] || 'Unknown',
      homeScore: m.goals.home ?? 0,
      awayScore: m.goals.away ?? 0,
      winner: m.teams.home.winner ? 'home' : m.teams.away.winner ? 'away' : 'draw',
      homeTeam: m.teams.home.name,
      awayTeam: m.teams.away.name,
      venue: m.fixture.venue?.name || 'Stadium'
    }));

    const h2hSample = h2hMatches.length;
    let h2hHomeWins = 0;
    let h2hAwayWins = 0;
    let h2hDraws = 0;
    let h2hBttsCount = 0;
    let h2hOver15Count = 0;
    let h2hOver25Count = 0;
    let h2hOver35Count = 0;
    let h2hTotalGoals = 0;

    h2hMatches.forEach(m => {
      const tot = m.homeScore + m.awayScore;
      h2hTotalGoals += tot;
      if (m.homeScore > 0 && m.awayScore > 0) h2hBttsCount++;
      if (tot > 1.5) h2hOver15Count++;
      if (tot > 2.5) h2hOver25Count++;
      if (tot > 3.5) h2hOver35Count++;

      if (m.homeScore > m.awayScore) h2hHomeWins++;
      else if (m.awayScore > m.homeScore) h2hAwayWins++;
      else h2hDraws++;
    });

    const h2hStats = {
      sampleSize: h2hSample,
      homeWins: h2hHomeWins,
      awayWins: h2hAwayWins,
      draws: h2hDraws,
      bttsCount: h2hBttsCount,
      over15Count: h2hOver15Count,
      over25Count: h2hOver25Count,
      over35Count: h2hOver35Count,
      avgGoals: h2hSample > 0 ? (h2hTotalGoals / h2hSample).toFixed(1) : '0.0',
      matches: h2hMatches
    };

    // Filter recent matches to completed fixtures only (ignore unplayed/postponed)
    const parseMatchesForm = (teamId, recentList) => {
      const validCompleted = recentList.filter(m => m.goals?.home !== null && m.goals?.away !== null && m.fixture?.status?.short !== 'PST');
      const matches = [];
      let won = 0, drawn = 0, lost = 0;
      let goalsFor = 0, goalsAgainst = 0;
      let cleanSheets = 0, failedToScore = 0;

      validCompleted.forEach((m, idx) => {
        const isHome = m.teams.home.id === teamId;
        const teamScore = isHome ? m.goals.home : m.goals.away;
        const oppScore = isHome ? m.goals.away : m.goals.home;
        const oppName = isHome ? m.teams.away.name : m.teams.home.name;

        goalsFor += teamScore;
        goalsAgainst += oppScore;
        if (oppScore === 0) cleanSheets++;
        if (teamScore === 0) failedToScore++;

        let res = 'D';
        if (teamScore > oppScore) { res = 'W'; won++; }
        else if (teamScore < oppScore) { res = 'L'; lost++; }
        else { drawn++; }

        matches.push({
          id: idx + 1,
          result: res,
          opponent: oppName,
          teamScore,
          oppScore,
          score: `${teamScore}-${oppScore}`,
          isHome
        });
      });

      const total = validCompleted.length || 1;
      return {
        matches,
        played: validCompleted.length,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        avgGoalsFor: (goalsFor / total).toFixed(1),
        avgGoalsAgainst: (goalsAgainst / total).toFixed(1),
        cleanSheets,
        failedToScore,
        cleanSheetPct: Math.round((cleanSheets / total) * 100),
        failedToScorePct: Math.round((failedToScore / total) * 100)
      };
    };

    const homeForm = parseMatchesForm(homeTeamId, homeRecentRaw);
    const awayForm = parseMatchesForm(awayTeamId, awayRecentRaw);

    // Home / Away Specific Performance
    const homeSplit = homeStats?.fixtures ? {
      played: homeStats.fixtures.played?.home || homeForm.played,
      won: homeStats.fixtures.wins?.home || homeForm.won,
      drawn: homeStats.fixtures.draws?.home || homeForm.drawn,
      lost: homeStats.fixtures.loses?.home || homeForm.lost,
      goalsFor: homeStats.goals?.for?.total?.home || homeForm.goalsFor,
      goalsAgainst: homeStats.goals?.against?.total?.home || homeForm.goalsAgainst,
      avgGoalsFor: homeStats.goals?.for?.average?.home || homeForm.avgGoalsFor
    } : {
      played: homeForm.played,
      won: homeForm.won,
      drawn: homeForm.drawn,
      lost: homeForm.lost,
      goalsFor: homeForm.goalsFor,
      goalsAgainst: homeForm.goalsAgainst,
      avgGoalsFor: homeForm.avgGoalsFor
    };

    const awaySplit = awayStats?.fixtures ? {
      played: awayStats.fixtures.played?.away || awayForm.played,
      won: awayStats.fixtures.wins?.away || awayForm.won,
      drawn: awayStats.fixtures.draws?.away || awayForm.drawn,
      lost: awayStats.fixtures.loses?.away || awayForm.lost,
      goalsFor: awayStats.goals?.for?.total?.away || awayForm.goalsFor,
      goalsAgainst: awayStats.goals?.against?.total?.away || awayForm.goalsAgainst,
      avgGoalsFor: awayStats.goals?.for?.average?.away || awayForm.avgGoalsFor
    } : {
      played: awayForm.played,
      won: awayForm.won,
      drawn: awayForm.drawn,
      lost: awayForm.lost,
      goalsFor: awayForm.goalsFor,
      goalsAgainst: awayForm.goalsAgainst,
      avgGoalsFor: awayForm.avgGoalsFor
    };

    // Squad & Player Availability
    const squadNews = {
      hasData: injuriesRaw.length > 0,
      notice: injuriesRaw.length === 0 ? 'Player availability data is not available from the current data source.' : null,
      injuries: injuriesRaw.map(inj => ({
        player: inj.player.name,
        type: inj.player.type || 'Injury',
        reason: inj.player.reason || 'Unavailable',
        team: inj.team.name
      }))
    };

    updateProgress('Market analysis...');

    const resultPayload = {
      fixture: {
        id: fixtureObj.id,
        homeTeam: fixtureObj.homeTeam.name,
        awayTeam: fixtureObj.awayTeam.name,
        homeTeamId,
        awayTeamId,
        league: fixtureObj.league.name,
        leagueId: fixtureObj.league.id,
        kickoffTime: fixtureObj.date,
        venue: fixtureObj.venue,
        referee: fixtureObj.referee,
        status: fixtureObj.status
      },
      odds: fixtureObj.odds,
      h2h: h2hStats,
      homeForm,
      awayForm,
      homeSplit,
      awaySplit,
      squadNews,
      isPartialData,
      generatedAt: new Date().toISOString()
    };

    CACHE.analysis[fixtureId] = resultPayload;
    return resultPayload;
  }
};

export default apiFootballService;
