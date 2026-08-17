import React from 'react';
import { Target, Zap, Activity, Award, Flame } from 'lucide-react';

export default function PredictionCard({ prediction, homeTeam, awayTeam }) {
  if (!prediction) return null;

  const { probabilities, expectedGoals, topPredictedScores, confidenceScore, valueBet } = prediction;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-4">
      {/* Header & Confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase">AI Poisson Prediction</h4>
            <p className="text-[10px] text-slate-400">Weighted Statistical Engine</p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-slate-400 font-medium">Confidence:</span>
          <span className="text-xs font-bold text-amber-400">{confidenceScore}%</span>
        </div>
      </div>

      {/* Win / Draw / Win Probability Progress Radar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold px-0.5">
          <span className="text-cyan-400">{homeTeam}: {probabilities.home}%</span>
          <span className="text-slate-400">Draw: {probabilities.draw}%</span>
          <span className="text-rose-400">{awayTeam}: {probabilities.away}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800 shadow-inner">
          <div 
            style={{ width: `${probabilities.home}%` }} 
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l-full transition-all duration-700"
            title={`${homeTeam}: ${probabilities.home}%`}
          />
          <div 
            style={{ width: `${probabilities.draw}%` }} 
            className="h-full bg-slate-600 transition-all duration-700"
            title={`Draw: ${probabilities.draw}%`}
          />
          <div 
            style={{ width: `${probabilities.away}%` }} 
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-r-full transition-all duration-700"
            title={`${awayTeam}: ${probabilities.away}%`}
          />
        </div>
      </div>

      {/* Grid: Expected Goals & Top Predicted Scorelines */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Expected Goals */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Expected Goals (xG)
          </span>
          <div className="mt-2 flex items-baseline justify-around font-mono">
            <div className="text-center">
              <span className="text-base font-bold text-cyan-400">{expectedGoals.home}</span>
              <span className="block text-[9px] text-slate-500 uppercase">{homeTeam.substring(0, 3)}</span>
            </div>
            <span className="text-xs text-slate-600 font-bold">:</span>
            <div className="text-center">
              <span className="text-base font-bold text-rose-400">{expectedGoals.away}</span>
              <span className="block text-[9px] text-slate-500 uppercase">{awayTeam.substring(0, 3)}</span>
            </div>
          </div>
        </div>

        {/* Top Scorelines */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            Likely Scorelines
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {topPredictedScores.map((s, idx) => (
              <span 
                key={idx}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  idx === 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' 
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                {s.score} <span className="text-[9px] text-slate-400">({s.probability})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Value Bet Recommendation */}
      {valueBet && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Value Selection Edge</span>
              <span className="text-xs text-slate-200 font-medium">{valueBet.selection}</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs font-bold text-emerald-400">@{valueBet.odds}</span>
            <span className="block text-[9px] text-emerald-300 font-semibold">{valueBet.edge}</span>
          </div>
        </div>
      )}
    </div>
  );
}
