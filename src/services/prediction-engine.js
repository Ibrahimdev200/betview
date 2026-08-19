/**
 * BetLens Swappable & Evidence-Based Statistical Prediction Engine
 */

function factorial(n) {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(k, lambda) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

class PredictionEngine {
  constructor() {
    this.weights = {
      recentForm: 0.25,
      homeAwayForm: 0.20,
      goalsTrends: 0.15,
      h2h: 0.15,
      defensiveForm: 0.15,
      playerAvailability: 0.10
    };
  }

  /**
   * Set custom configurable weights
   */
  setWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  predict(homeTeam, awayTeam, h2h, homeForm, awayForm, odds = null, homeSplit = null, awaySplit = null, squadNews = null) {
    const hForm = homeForm || { matches: [], played: 5, avgGoalsFor: '1.5', avgGoalsAgainst: '1.0', cleanSheets: 2, failedToScore: 1, cleanSheetPct: 40 };
    const aForm = awayForm || { matches: [], played: 5, avgGoalsFor: '1.2', avgGoalsAgainst: '1.4', cleanSheets: 1, failedToScore: 2, cleanSheetPct: 20 };

    const leagueAvgGoals = 1.45;
    const homeGoalsAvg = parseFloat(hForm.avgGoalsFor || '1.5');
    const homeConcededAvg = parseFloat(hForm.avgGoalsAgainst || '1.0');
    const awayGoalsAvg = parseFloat(aForm.avgGoalsFor || '1.2');
    const awayConcededAvg = parseFloat(aForm.avgGoalsAgainst || '1.4');

    const homeAttackRating = homeGoalsAvg / leagueAvgGoals;
    const homeDefenseRating = homeConcededAvg / leagueAvgGoals;
    const awayAttackRating = awayGoalsAvg / leagueAvgGoals;
    const awayDefenseRating = awayConcededAvg / leagueAvgGoals;

    const homeAdvantage = 1.15;
    let lambdaHome = Math.max(0.4, Math.min(3.8, homeAttackRating * awayDefenseRating * leagueAvgGoals * homeAdvantage));
    let lambdaAway = Math.max(0.3, Math.min(3.2, awayAttackRating * homeDefenseRating * leagueAvgGoals));

    // 6x6 Poisson Goal Matrix
    let homeWinProb = 0, drawProb = 0, awayWinProb = 0;
    const scorelines = [];

    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        const p = poisson(h, lambdaHome) * poisson(a, lambdaAway);
        if (h > a) homeWinProb += p;
        else if (h === a) drawProb += p;
        else awayWinProb += p;

        scorelines.push({ homeScore: h, awayScore: a, score: `${h}-${a}`, prob: p });
      }
    }

    scorelines.sort((a, b) => b.prob - a.prob);
    const topScorelines = scorelines.slice(0, 4).map(s => ({
      score: s.score,
      probability: (s.prob * 100).toFixed(1) + '%'
    }));

    // H2H Adjustments
    const h2hObj = h2h || { sampleSize: 0, homeWins: 0, awayWins: 0, draws: 0, bttsCount: 0, over15Count: 0, over25Count: 0 };
    const h2hSample = h2hObj.sampleSize || (Array.isArray(h2h) ? h2h.length : 0);

    if (h2hSample > 0) {
      const hWins = h2hObj.homeWins || 0;
      const aWins = h2hObj.awayWins || 0;
      const h2hHomeAdj = (hWins / h2hSample) * 0.08;
      const h2hAwayAdj = (aWins / h2hSample) * 0.08;
      homeWinProb = Math.max(0.05, homeWinProb + h2hHomeAdj - h2hAwayAdj / 2);
      awayWinProb = Math.max(0.05, awayWinProb + h2hAwayAdj - h2hHomeAdj / 2);
      drawProb = Math.max(0.05, 1 - homeWinProb - awayWinProb);
    }

    const totalProb = homeWinProb + drawProb + awayWinProb;
    const homePercent = Math.round((homeWinProb / totalProb) * 100);
    const awayPercent = Math.round((awayWinProb / totalProb) * 100);
    const drawPercent = 100 - homePercent - awayPercent;

    // Over/Under Goal Probabilities
    const totalXg = lambdaHome + lambdaAway;
    const over15Prob = Math.min(95, Math.round((1 - (poisson(0, totalXg) + poisson(1, totalXg))) * 100));
    const over25Prob = Math.min(92, Math.round((1 - (poisson(0, totalXg) + poisson(1, totalXg) + poisson(2, totalXg))) * 100));
    const bttsProb = Math.min(90, Math.round((1 - poisson(0, lambdaHome)) * (1 - poisson(0, lambdaAway)) * 100));
    const dc1xProb = Math.min(96, homePercent + drawPercent);
    const dcX2Prob = Math.min(96, awayPercent + drawPercent);

    // Evaluate Betting Markets & Confidence Scores
    const evaluateMarketCategory = (score) => {
      if (score >= 80) return 'Very Strong';
      if (score >= 70) return 'Strong';
      if (score >= 60) return 'Moderate';
      if (score >= 50) return 'Weak';
      return 'Avoid';
    };

    const markets = [
      { name: 'Over 1.5 Goals', confidence: over15Prob, category: evaluateMarketCategory(over15Prob), odds: odds?.over25 ? parseFloat((odds.over25 * 0.82).toFixed(2)) : 1.30 },
      { name: 'Over 2.5 Goals', confidence: over25Prob, category: evaluateMarketCategory(over25Prob), odds: odds?.over25 || 1.80 },
      { name: 'Both Teams To Score (BTTS)', confidence: bttsProb, category: evaluateMarketCategory(bttsProb), odds: odds?.btts || 1.75 },
      { name: `${homeTeam} Win or Draw (1X)`, confidence: dc1xProb, category: evaluateMarketCategory(dc1xProb), odds: odds?.dc1x || 1.25 },
      { name: `${homeTeam} Win (1)`, confidence: homePercent, category: evaluateMarketCategory(homePercent), odds: odds?.home || 1.85 },
      { name: `${awayTeam} Win or Draw (X2)`, confidence: dcX2Prob, category: evaluateMarketCategory(dcX2Prob), odds: odds?.away ? parseFloat((odds.away * 0.65).toFixed(2)) : 1.45 },
      { name: `${awayTeam} Win (2)`, confidence: awayPercent, category: evaluateMarketCategory(awayPercent), odds: odds?.away || 2.80 }
    ];

    // Filter Recommended Markets (Score >= 60)
    const recommendedMarkets = markets
      .filter(m => m.confidence >= 60)
      .sort((a, b) => b.confidence - a.confidence);

    const topMarket = recommendedMarkets[0] || markets[0];
    const overallConfidence = topMarket ? topMarket.confidence : 50;

    // Generate Dynamic Evidence-Based "Why?" Bullets
    const whyBullets = [];
    if (hForm.played > 0) {
      whyBullets.push(`${homeTeam} scored in ${hForm.played - hForm.failedToScore} of their last ${hForm.played} matches (Avg: ${hForm.avgGoalsFor} goals/game).`);
    }
    if (aForm.played > 0) {
      whyBullets.push(`${awayTeam} conceded in ${aForm.played - aForm.cleanSheets} of their last ${aForm.played} matches (Avg: ${aForm.avgGoalsAgainst} conceded/game).`);
    }
    whyBullets.push(`Combined expected goals model: ${totalXg.toFixed(1)} goals per match.`);
    if (h2hSample > 0) {
      whyBullets.push(`H2H History: ${h2hObj.over15Count}/${h2hSample} matches produced 2+ goals.`);
    }

    // Generate Risk Factors
    const riskFactors = [];
    if (aForm.cleanSheets >= 2) {
      riskFactors.push(`${awayTeam} has solid defensive form with ${aForm.cleanSheets} clean sheets in recent matches.`);
    }
    if (h2hSample < 3) {
      riskFactors.push(`Small historical H2H sample size (${h2hSample} match${h2hSample === 1 ? '' : 'es'}).`);
    }
    if (squadNews?.notice) {
      riskFactors.push(squadNews.notice);
    } else if (squadNews?.injuries?.length > 0) {
      squadNews.injuries.slice(0, 2).forEach(inj => {
        riskFactors.push(`Player unavailable: ${inj.player} (${inj.team} - ${inj.reason || inj.type}).`);
      });
    }
    if (Math.abs(homePercent - awayPercent) < 10) {
      riskFactors.push('Tight statistical margin between home and away win probabilities.');
    }

    // Overall Verdict
    let verdict;
    if (overallConfidence >= 70 && topMarket) {
      verdict = {
        status: 'GOOD',
        badge: '🟢 GOOD ANALYSIS OPPORTUNITY',
        bestMarket: topMarket.name,
        confidenceScore: overallConfidence,
        ratingCategory: evaluateMarketCategory(overallConfidence),
        riskLevel: overallConfidence >= 80 ? 'Low' : 'Moderate',
        reason: `Strong statistical backing for ${topMarket.name} with ${overallConfidence}% BetLens Confidence Score.`
      };
    } else {
      verdict = {
        status: 'AVOID',
        badge: '🔴 AVOID',
        bestMarket: 'None',
        confidenceScore: overallConfidence,
        ratingCategory: 'Avoid',
        riskLevel: 'High',
        reason: 'Available statistics are conflicting or confidence is below threshold. No strong betting market identified.'
      };
    }

    return {
      probabilities: {
        home: homePercent,
        draw: drawPercent,
        away: awayPercent
      },
      expectedGoals: {
        home: parseFloat(lambdaHome.toFixed(2)),
        away: parseFloat(lambdaAway.toFixed(2)),
        total: parseFloat(totalXg.toFixed(2))
      },
      topPredictedScores: topScorelines,
      mostLikelyScore: topScorelines[0]?.score || '1-1',
      confidenceScore: overallConfidence,
      confidenceCategory: evaluateMarketCategory(overallConfidence),
      recommendedMarkets,
      whyBullets,
      riskFactors,
      verdict,
      timestamp: new Date().toISOString()
    };
  }
}

const engine = new PredictionEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = engine;
}

export default engine;
