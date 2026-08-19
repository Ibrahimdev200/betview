import React from 'react';
import PredictionCard from './PredictionCard';
import SelectedOddsRecommendationCard from './SelectedOddsRecommendationCard';
import FormBadge from './FormBadge';
import H2HCard from './H2HCard';
import StandingsCard from './StandingsCard';
import SquadNewsCard from './SquadNewsCard';
import { Calendar, ShieldAlert, Sparkles, RefreshCw, BarChart2, MousePointerClick, CheckCircle2, AlertTriangle, Info, MapPin, User, Star } from 'lucide-react';

export default function AnalyticsPanel({
  analytics,
  isLoading,
  loadingStep,
  error,
  selectedMatchId,
  onRefresh,
  isOpen,
  onApplyRecommendation
}) {
  if (!isOpen) return null;

  // 1. Loading State Experience (Requirement 15)
  if (isLoading) {
    const steps = [
      'Loading fixture data',
      'Loading team statistics',
      'Checking recent form',
      'Checking H2H',
      'Checking player information',
      'Calculating BetLens analysis'
    ];

    const currentStepIndex = steps.findIndex(s => s.toLowerCase() === loadingStep?.toLowerCase()) >= 0
      ? steps.findIndex(s => s.toLowerCase() === loadingStep?.toLowerCase())
      : 2;

    return (
      <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center space-y-6 shadow-2xl z-20 select-none">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative shadow-xl">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-cyan-400 absolute" />
        </div>

        <div className="text-center space-y-1">
          <h4 className="text-sm font-black text-slate-100 tracking-wide">Analyzing Match...</h4>
          <p className="text-xs text-slate-400 font-mono">Running BetLens Analytical Pipeline</p>
        </div>

        {/* Animated Progress Steps */}
        <div className="w-full space-y-2 bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs font-mono">
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={isDone ? 'text-emerald-300 font-semibold' : isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                  {isDone ? `✓ ${step}` : isCurrent ? `⟳ ${step}...` : step}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  // 2. Error State (Requirement 16)
  if (error) {
    return (
      <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl z-20 select-none">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 shadow-xl">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2 max-w-[280px]">
          <h4 className="text-sm font-extrabold text-rose-300">Unable to analyze this match</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The match was loaded successfully, but detailed statistics could not be retrieved from the data provider.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="mt-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Analysis</span>
        </button>
      </aside>
    );
  }

  // 3. No Selection State
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
            Click any match card or odds market from the <strong className="text-cyan-400">Daily Match List</strong> to run complete analysis.
          </p>
        </div>
      </aside>
    );
  }

  const { fixture, prediction, h2h, homeForm, awayForm, standings, squadNews, odds, isPartialData } = analytics;
  const verdict = prediction?.verdict || {};
  const recommendedMarkets = prediction?.recommendedMarkets || [];
  const whyBullets = prediction?.whyBullets || [];
  const riskFactors = prediction?.riskFactors || [];

  return (
    <aside className="w-[380px] h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl z-20 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono">
            {fixture.league || 'Football League'}
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
          title="Recalculate BetLens Analysis"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Match Information Sub-bar (Venue, Referee, Kickoff) */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-2 flex flex-col gap-1 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 truncate max-w-[200px]" title={fixture.venue}>
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{fixture.venue || 'Match Venue'}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <User className="w-3 h-3 text-slate-500" />
            <span>{fixture.referee || 'Referee N/A'}</span>
          </span>
        </div>
      </div>

      {/* Partial Analysis Banner if applicable */}
      {isPartialData && (
        <div className="bg-amber-950/50 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-300 flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Partial Analysis: Some statistics are unavailable from data provider. Using available data only.</span>
        </div>
      )}

      {/* Scrollable Analytics Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* BetLens Verdict Banner (Requirement 14) */}
        <div className={`p-4 rounded-xl border shadow-xl space-y-3 ${
          verdict.status === 'GOOD'
            ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-950 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border uppercase tracking-wider font-mono ${
              verdict.status === 'GOOD'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}>
              {verdict.badge || (verdict.status === 'GOOD' ? '🟢 GOOD ANALYSIS OPPORTUNITY' : '🔴 AVOID')}
            </span>

            {/* Overall Star Rating (Requirement 11) */}
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className={`w-3.5 h-3.5 ${prediction?.confidenceScore >= 75 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
              <Star className={`w-3.5 h-3.5 ${prediction?.confidenceScore >= 85 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Best Supported Market:</span>
              <span className="font-extrabold text-cyan-300 truncate block">{verdict.bestMarket || 'Over 1.5 Goals'}</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Confidence Score:</span>
              <span className="font-black text-amber-400 text-sm">{prediction?.confidenceScore || 75}/100</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
            {verdict.reason || 'Strong statistical backing based on recent scoring trends and home/away statistics.'}
          </p>
        </div>

        {/* Selected Odds AI Advisor */}
        <SelectedOddsRecommendationCard
          selectedMarket={analytics.selectedMarket}
          fixture={fixture}
          prediction={prediction}
          onApplyRecommendation={onApplyRecommendation}
        />

        {/* Recommended Markets List (Requirement 11) */}
        {recommendedMarkets.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Recommended Markets</h4>
            </div>

            <div className="space-y-1.5 font-mono">
              {recommendedMarkets.map((m, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{m.name}</span>
                    <span className="text-[10px] text-slate-400">Rating: <strong className="text-cyan-400">{m.category}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 block">Score: {m.confidence}</span>
                    <span className="text-[10px] text-slate-400">@{m.odds}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* "Why?" Data Explanations Card (Requirement 12) */}
        {whyBullets.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <span>Why {analytics.selectedMarket?.marketName || 'This Pick'}?</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {whyBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="leading-snug">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚠ Risk Factors Card (Requirement 13) */}
        {riskFactors.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-800/50 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>⚠ Risk Factors</span>
            </h4>
            <div className="space-y-1.5 text-xs text-amber-200/90">
              {riskFactors.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/80 p-2 rounded-lg border border-amber-900/40">
                  <span className="text-amber-400 font-bold">•</span>
                  <span className="leading-snug">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prediction Engine Detailed Card */}
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
