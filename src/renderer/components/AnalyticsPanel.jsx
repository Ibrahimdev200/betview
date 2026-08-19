import React, { useState } from 'react';
import PredictionCard from './PredictionCard';
import SelectedOddsRecommendationCard from './SelectedOddsRecommendationCard';
import FormBadge from './FormBadge';
import H2HCard from './H2HCard';
import StandingsCard from './StandingsCard';
import SquadNewsCard from './SquadNewsCard';
import { Calendar, ShieldAlert, Sparkles, RefreshCw, BarChart2, MousePointerClick, CheckCircle2, AlertTriangle, MapPin, User, Star, Activity, ListChecks, Target } from 'lucide-react';
import predictionEngine from '../../services/prediction-engine';

export default function AnalyticsPanel({
  analytics,
  isLoading,
  loadingStep,
  error,
  selectedMatchId,
  onRefresh,
  isOpen,
  onSelectMarketKey,
  onApplyRecommendation
}) {
  if (!isOpen) return null;

  // 1. Loading Experience (Requirement 22)
  if (isLoading) {
    const steps = [
      'Fixture information',
      'Recent form',
      'Home/Away statistics',
      'Head-to-head',
      'Team statistics',
      'Market analysis'
    ];

    const currentStepIndex = steps.findIndex(s => s.toLowerCase().includes(loadingStep?.toLowerCase())) >= 0
      ? steps.findIndex(s => s.toLowerCase().includes(loadingStep?.toLowerCase()))
      : 3;

    return (
      <aside className="w-[420px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center space-y-6 shadow-2xl z-20 select-none">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative shadow-xl">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-cyan-400 absolute" />
        </div>

        <div className="text-center space-y-1">
          <h4 className="text-sm font-black text-slate-100 tracking-wide">Analyzing Match...</h4>
          <p className="text-xs text-slate-400 font-mono">Running BetLens Market Engine</p>
        </div>

        {/* Animated Progress Checklist */}
        <div className="w-full space-y-2.5 bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs font-mono">
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

  // 2. Error State (Requirement 21)
  if (error) {
    return (
      <aside className="w-[420px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl z-20 select-none">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 shadow-xl">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2 max-w-[280px]">
          <h4 className="text-sm font-extrabold text-rose-300">Unable to analyze this match</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The match loaded successfully, but detailed statistics could not be retrieved.
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

  // 3. No Selection State (Requirement 5)
  if (!analytics || !analytics.fixture) {
    return (
      <aside className="w-[420px] h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl z-20 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl relative">
          <BarChart2 className="w-8 h-8" />
          <MousePointerClick className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 animate-bounce" />
        </div>
        <div className="space-y-2 max-w-[260px]">
          <h4 className="text-sm font-extrabold text-slate-200">Select a match to begin analysis</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any match from the sportsbook list to run BetLens analysis.
          </p>
        </div>
      </aside>
    );
  }

  const { fixture, prediction, h2h, homeForm, awayForm, standings, squadNews, odds, isPartialData } = analytics;

  // Active Market Analysis (Requirement 11)
  const marketAnalysis = analytics.marketAnalysis || predictionEngine.analyzeSpecificMarket('goals_over25', analytics);
  const selectedMarketKey = marketAnalysis.selectedMarketKey || 'goals_over25';
  const factors = marketAnalysis.factorsBreakdown || [];
  const whyBullets = marketAnalysis.whyBullets || [];
  const riskFactors = marketAnalysis.riskFactors || [];
  const verdict = marketAnalysis.verdict || {};

  const activeMarketOptions = [
    { key: 'goals_over25', label: 'Over 2.5 Goals', category: 'Goals' },
    { key: 'goals_over15', label: 'Over 1.5 Goals', category: 'Goals' },
    { key: 'goals_over35', label: 'Over 3.5 Goals', category: 'Goals' },
    { key: 'goals_under25', label: 'Under 2.5 Goals', category: 'Goals' },
    { key: 'btts_yes', label: 'BTTS (Yes)', category: 'BTTS' },
    { key: 'match_result_home', label: `${fixture.homeTeam} Win (1)`, category: 'Result' },
    { key: 'double_chance_1x', label: `${fixture.homeTeam} or Draw (1X)`, category: 'Result' },
    { key: 'corners_over', label: 'Over 8.5 Corners', category: 'Corners' },
    { key: 'cards_over', label: 'Over 3.5 Cards', category: 'Cards' }
  ];

  return (
    <aside className="w-[420px] h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl z-20 overflow-hidden select-none">
      {/* 1. Sidebar Header (Requirement 5) */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono">
            {fixture.league || 'Football League'}
          </span>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2 mt-0.5">
            <span>{fixture.homeTeam}</span>
            <span className="text-slate-500 font-normal text-xs">vs</span>
            <span>{fixture.awayTeam}</span>
          </h3>
        </div>

        <button 
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Recalculate Analysis"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Match Information Sub-bar (Venue, Referee, Date) */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1 truncate max-w-[220px]" title={fixture.venue}>
          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{fixture.venue || 'Match Venue'}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <User className="w-3 h-3 text-slate-500" />
          <span>{fixture.referee || 'Referee N/A'}</span>
        </span>
      </div>

      {/* Partial Data Notice if applicable */}
      {isPartialData && (
        <div className="bg-amber-950/50 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-300 flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Partial analysis: Some statistics are unavailable from current data provider.</span>
        </div>
      )}

      {/* 2. MARKET SELECTION TABS BAR (Requirement 6 & 7) */}
      <div className="bg-slate-900 border-b border-slate-800/80 p-2 shrink-0">
        <span className="text-[10px] font-mono text-slate-400 font-bold block mb-1.5 px-1 uppercase tracking-wider flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-400" />
          <span>Select Market to Analyze:</span>
        </span>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {activeMarketOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSelectMarketKey && onSelectMarketKey(opt.key)}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all border shrink-0 font-mono ${
                selectedMarketKey === opt.key
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Analytics Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 3. BETLENS SCORE HEADER (Requirement 12) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block uppercase">TARGET MARKET:</span>
              <h4 className="text-sm font-extrabold text-white">{marketAnalysis.marketTitle}</h4>
            </div>

            {/* Rating Category Badge */}
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider font-mono ${
              marketAnalysis.betlensScore >= 80
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : marketAnalysis.betlensScore >= 70
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                  : marketAnalysis.betlensScore >= 60
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}>
              {marketAnalysis.ratingBadge}
            </span>
          </div>

          {/* BetLens Score Gauge */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">BETLENS SCORE</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{marketAnalysis.betlensScore}<span className="text-xs text-slate-500 font-normal">/100</span></span>
            </div>

            <div className="w-48 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Confidence</span>
                <span className="text-cyan-300 font-bold">{marketAnalysis.ratingCategory}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${marketAnalysis.betlensScore}%` }}
                  className={`h-full transition-all duration-700 ${
                    marketAnalysis.betlensScore >= 70 ? 'bg-emerald-400' : marketAnalysis.betlensScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. CONFIDENCE FACTORS BREAKDOWN TABLE (Requirement 14) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-cyan-400" />
              <span>Confidence Factors Breakdown</span>
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">{marketAnalysis.betlensScore}/100 TOTAL</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {factors.map((f, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">{f.name} {f.note && <span className="text-[9px] text-amber-400">{f.note}</span>}</span>
                <span className="font-bold text-cyan-400">{f.points}<span className="text-slate-600 font-normal">/{f.max}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. EVIDENCE BREAKDOWN ("WHY BETLENS RATES THIS MARKET") (Requirement 13) */}
        {whyBullets.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Why BetLens Rates This Market</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {whyBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span className="leading-snug">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ⚠ RISK ANALYSIS (Requirement 15) */}
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

        {/* 7. FINAL BETLENS VERDICT (Requirement 16) */}
        <div className={`p-4 rounded-xl border shadow-xl space-y-2.5 font-mono ${
          verdict.status === 'STRONG'
            ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border-emerald-500/40'
            : verdict.status === 'MODERATE'
              ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border-amber-500/40'
              : 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-950 border-rose-500/40'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">FINAL BETLENS VERDICT</span>
          <h4 className={`text-sm font-black uppercase ${
            verdict.status === 'STRONG' ? 'text-emerald-400' : verdict.status === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {verdict.title}
          </h4>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Selected Market:</span>
              <span className="text-white font-bold">{verdict.selectedMarket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BetLens Score:</span>
              <span className="text-amber-400 font-bold">{verdict.score}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Level:</span>
              <span className={verdict.risk === 'Low' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{verdict.risk}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
            {verdict.why}
          </p>
        </div>

        {/* Selected Odds AI Advisor */}
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
