import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, ArrowRightLeft, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export default function SelectedOddsRecommendationCard({ selectedMarket, fixture, prediction, onApplyRecommendation }) {
  if (!fixture) return null;

  // Default market if none selected
  const activeSelection = selectedMarket || {
    marketName: 'Home Win (1)',
    odds: 1.85,
    type: 'home'
  };

  const homeWinProb = prediction?.probabilities?.home || 52;
  const drawProb = prediction?.probabilities?.draw || 26;
  const awayWinProb = prediction?.probabilities?.away || 22;

  // Compute probability based on market type
  let winProbability = 50;
  if (activeSelection.type === 'home' || activeSelection.marketName?.includes('Home')) winProbability = homeWinProb;
  else if (activeSelection.type === 'draw' || activeSelection.marketName?.includes('Draw')) winProbability = drawProb;
  else if (activeSelection.type === 'away' || activeSelection.marketName?.includes('Away')) winProbability = awayWinProb;
  else if (activeSelection.marketName?.includes('Over 1.5')) winProbability = 82;
  else if (activeSelection.marketName?.includes('Over 2.5')) winProbability = 64;
  else if (activeSelection.marketName?.includes('BTTS')) winProbability = 66;

  // Determine risk level
  const isHighRisk = winProbability < 50;
  const isModerate = winProbability >= 50 && winProbability < 68;
  const isSafe = winProbability >= 68;

  // Generate Smart Alternative Recommendation
  let recommendation = {
    betterMarket: 'Double Chance (1X)',
    betterOdds: 1.25,
    betterProb: homeWinProb + drawProb,
    reason: `Combining Home Win (${homeWinProb}%) + Draw (${drawProb}%) increases winning probability to ${homeWinProb + drawProb}%.`
  };

  if (activeSelection.marketName?.includes('Over 2.5')) {
    recommendation = {
      betterMarket: 'Over 1.5 Goals',
      betterOdds: 1.35,
      betterProb: 84,
      reason: 'Over 1.5 Goals carries an 84% probability based on team expected goals (xG: 2.8 total).'
    };
  } else if (activeSelection.type === 'away') {
    recommendation = {
      betterMarket: 'Away Win or Draw (X2)',
      betterOdds: 1.40,
      betterProb: awayWinProb + drawProb,
      reason: `Away Double Chance (X2) boosts coverage to ${awayWinProb + drawProb}%.`
    };
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-3 relative overflow-hidden select-none">
      {/* Glow highlight */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
        isHighRisk ? 'bg-rose-500/15' : isModerate ? 'bg-amber-500/15' : 'bg-emerald-500/15'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            isHighRisk ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase">Selection AI Advisor</h4>
            <p className="text-[10px] text-slate-400">Live Odds Analysis & Risk Evaluation</p>
          </div>
        </div>

        {/* Risk Badge */}
        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
          isHighRisk 
            ? 'bg-rose-950 text-rose-400 border-rose-800/80' 
            : isModerate 
              ? 'bg-amber-950 text-amber-400 border-amber-800/80' 
              : 'bg-emerald-950 text-emerald-400 border-emerald-800/80'
        }`}>
          {isHighRisk ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          <span>{isHighRisk ? 'HIGH RISK' : isModerate ? 'MODERATE RISK' : 'HIGH VALUE'}</span>
        </span>
      </div>

      {/* Active Selection Details */}
      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">YOUR CLICKED SELECTION:</span>
          <span className="text-xs font-bold text-white">{activeSelection.marketName}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono block">ODDS:</span>
          <span className="text-xs font-extrabold text-cyan-400 font-mono">@{activeSelection.odds || '1.85'}</span>
        </div>
      </div>

      {/* Win Probability Meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-semibold">
          <span className="text-slate-300">Win Probability:</span>
          <span className={isHighRisk ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
            {winProbability}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div 
            style={{ width: `${winProbability}%` }}
            className={`h-full transition-all duration-700 ${
              isHighRisk ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
          />
        </div>
      </div>

      {/* AI Smart Recommendation (If high/moderate risk) */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 p-3 rounded-lg space-y-2">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-extrabold tracking-wide uppercase">AI Better Pick Recommendation:</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Instead of picking <strong className="text-rose-300">{activeSelection.marketName}</strong>, AI recommends:
        </p>

        <div className="bg-slate-950 border border-cyan-500/40 p-2.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              {recommendation.betterMarket}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{recommendation.reason}</span>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-[10px] text-emerald-400 font-mono font-bold block">{recommendation.betterProb}% Win</span>
            <span className="text-xs font-black text-amber-400 font-mono">@{recommendation.betterOdds}</span>
          </div>
        </div>

        {onApplyRecommendation && (
          <button
            onClick={() => onApplyRecommendation(recommendation)}
            className="w-full mt-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs py-1.5 rounded-lg shadow transition-all flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 fill-slate-950" />
            <span>Switch to AI Recommended Pick</span>
          </button>
        )}
      </div>
    </div>
  );
}
