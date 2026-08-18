import React from 'react';
import PredictionCard from './PredictionCard';
import SelectedOddsRecommendationCard from './SelectedOddsRecommendationCard';
import FormBadge from './FormBadge';
import H2HCard from './H2HCard';
import StandingsCard from './StandingsCard';
import SquadNewsCard from './SquadNewsCard';
import { Calendar, ShieldAlert, Sparkles, RefreshCw, BarChart2, MousePointerClick } from 'lucide-react';

export default function AnalyticsPanel({ analytics, isLoading, onRefresh, isOpen, onApplyRecommendation }) {
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center space-y-4 shadow-2xl z-20">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="text-center space-y-1">
          <h4 className="text-sm font-bold text-slate-200">Analyzing Fixture Data...</h4>
          <p className="text-xs text-slate-500">Executing Poisson Goal Model & SQLite Lookup</p>
        </div>
      </aside>
    );
  }

  if (!analytics || !analytics.fixture) {
    return (
      <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl z-20 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl relative">
          <BarChart2 className="w-8 h-8" />
          <MousePointerClick className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 animate-bounce" />
        </div>
        <div className="space-y-2 max-w-[260px]">
          <h4 className="text-sm font-extrabold text-slate-200">No Match Selected</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any daily game or odds market from the <strong className="text-cyan-400">API-Football Live Feed</strong> to evaluate win probability in real-time.
          </p>
          <div className="pt-2 flex flex-col gap-1 text-[11px] font-mono text-slate-500">
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">✅ GOOD BET detection</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">⚠️ BAD BET warning</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">⚡ UNDER PROBABILITY recommendations</span>
          </div>
        </div>
      </aside>
    );
  }

  const { fixture, prediction, h2h, homeForm, awayForm, standings, squadNews, odds } = analytics;

  return (
    <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800/80 flex flex-col shadow-2xl z-20 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono">
            {fixture.league || 'Premier League'}
          </span>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 mt-0.5">
            <span>{fixture.homeTeam}</span>
            <span className="text-slate-500 font-normal text-xs">vs</span>
            <span>{fixture.awayTeam}</span>
          </h3>
        </div>

        <button 
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Recalculate Model"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Live Odds Banner */}
      {odds && (
        <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-2 flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] text-slate-400 font-medium">Bookmaker 1X2 Odds:</span>
          <div className="flex gap-2">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-400 font-bold">1 @{odds.home}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-bold">X @{odds.draw}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-rose-400 font-bold">2 @{odds.away}</span>
          </div>
        </div>
      )}

      {/* Scrollable Analytics List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected Odds AI Advisor & Recommendation Card */}
        <SelectedOddsRecommendationCard
          selectedMarket={analytics.selectedMarket}
          fixture={fixture}
          prediction={prediction}
          onApplyRecommendation={onApplyRecommendation}
        />

        {/* Prediction Engine Card */}
        <PredictionCard 
          prediction={prediction} 
          homeTeam={fixture.homeTeam} 
          awayTeam={fixture.awayTeam} 
        />

        {/* Team Form Badges */}
        <FormBadge teamName={fixture.homeTeam} form={homeForm} isHome={true} />
        <FormBadge teamName={fixture.awayTeam} form={awayForm} isHome={false} />

        {/* Head to Head Timeline */}
        <H2HCard h2h={h2h} homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />

        {/* League Table Positions */}
        <StandingsCard standings={standings} homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />

        {/* Squad & Injury News */}
        <SquadNewsCard squadNews={squadNews} homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />
      </div>
    </aside>
  );
}

