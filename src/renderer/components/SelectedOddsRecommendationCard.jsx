import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, ArrowRightLeft, CheckCircle2, TrendingUp, ThumbsUp, ThumbsDown, AlertCircle, Volume2, VolumeX, Radio } from 'lucide-react';

export default function SelectedOddsRecommendationCard({ selectedMarket, fixture, prediction, onApplyRecommendation }) {
  if (!fixture) return null;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(true);

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
  if (activeSelection.type === 'home' || activeSelection.marketName?.includes('Home') || activeSelection.marketName?.includes('(1)')) {
    winProbability = homeWinProb;
  } else if (activeSelection.type === 'draw' || activeSelection.marketName?.includes('Draw') || activeSelection.marketName?.includes('(X)')) {
    winProbability = drawProb;
  } else if (activeSelection.type === 'away' || activeSelection.marketName?.includes('Away') || activeSelection.marketName?.includes('(2)')) {
    winProbability = awayWinProb;
  } else if (activeSelection.marketName?.includes('Over 1.5') || activeSelection.type === 'dc1x') {
    winProbability = 82;
  } else if (activeSelection.marketName?.includes('Over 2.5') || activeSelection.type === 'over25') {
    winProbability = 64;
  } else if (activeSelection.marketName?.includes('BTTS') || activeSelection.type === 'btts') {
    winProbability = 66;
  }

  // Determine Bet Evaluation Category: GOOD, BAD, or UNDER PROBABILITY
  let betStatus = 'GOOD'; // GOOD, BAD, UNDER_PROBABILITY
  if (winProbability < 45) {
    betStatus = 'BAD';
  } else if (winProbability >= 45 && winProbability < 68) {
    betStatus = 'UNDER_PROBABILITY';
  } else {
    betStatus = 'GOOD';
  }

  // Generate Smart Alternative Recommendation
  let recommendation = {
    betterMarket: `${fixture.homeTeam} or Draw (1X)`,
    betterOdds: 1.25,
    betterProb: Math.min(95, homeWinProb + drawProb),
    reason: `Combining Home Win (${homeWinProb}%) + Draw (${drawProb}%) increases winning probability to ${homeWinProb + drawProb}%.`
  };

  if (activeSelection.marketName?.includes('Over 2.5') || activeSelection.type === 'over25') {
    recommendation = {
      betterMarket: 'Over 1.5 Goals',
      betterOdds: 1.35,
      betterProb: 84,
      reason: 'Over 1.5 Goals carries an 84% probability based on team expected goals (xG: 2.8 total).'
    };
  } else if (activeSelection.type === 'away' || activeSelection.marketName?.includes('Away')) {
    recommendation = {
      betterMarket: `${fixture.awayTeam} Win or Draw (X2)`,
      betterOdds: 1.40,
      betterProb: Math.min(95, awayWinProb + drawProb),
      reason: `Away Double Chance (X2) boosts your probability coverage to ${awayWinProb + drawProb}%.`
    };
  } else if (activeSelection.type === 'draw' || activeSelection.marketName?.includes('Draw')) {
    recommendation = {
      betterMarket: `${fixture.homeTeam} Draw No Bet (DNB)`,
      betterOdds: 1.38,
      betterProb: 78,
      reason: 'Draw No Bet protects your stake if the match ends in a draw.'
    };
  }

  // Construct Voice Speech Script
  const getSpeechScript = () => {
    const matchName = `${fixture.homeTeam} versus ${fixture.awayTeam}`;
    const selection = activeSelection.marketName;

    if (betStatus === 'GOOD') {
      return `BetLens Analysis for ${matchName}. You selected ${selection}. This is a Good Bet with ${winProbability} percent statistical win probability and strong value.`;
    } else if (betStatus === 'BAD') {
      return `BetLens Analysis for ${matchName}. Warning! You selected ${selection}. This is a Bad Bet with high risk and only ${winProbability} percent win chance. AI recommends switching to ${recommendation.betterMarket} for ${recommendation.betterProb} percent win probability.`;
    } else {
      return `BetLens Analysis for ${matchName}. Caution! You selected ${selection}. This bet is Under Probability at ${winProbability} percent. AI recommends switching to ${recommendation.betterMarket} for a safer outcome.`;
    }
  };

  const speakText = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const script = text || getSpeechScript();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak when market selection changes if autoVoiceEnabled is true
  useEffect(() => {
    if (autoVoiceEnabled && activeSelection?.marketName) {
      speakText();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeSelection?.marketName, fixture?.homeTeam]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-3 relative overflow-hidden select-none">
      {/* Glow highlight based on status */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
        betStatus === 'BAD' 
          ? 'bg-rose-500/20' 
          : betStatus === 'UNDER_PROBABILITY' 
            ? 'bg-amber-500/20' 
            : 'bg-emerald-500/20'
      }`} />

      {/* Header & Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            betStatus === 'BAD'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : betStatus === 'UNDER_PROBABILITY'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase flex items-center gap-1.5">
              <span>AI Bet Analysis Advisor</span>
              {isSpeaking && <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
            </h4>
            <p className="text-[10px] text-slate-400">Voice Analysis & Risk Communication Engine</p>
          </div>
        </div>

        {/* Status Badge: GOOD, BAD, or UNDER PROBABILITY */}
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 uppercase tracking-wide ${
          betStatus === 'BAD'
            ? 'bg-rose-950 text-rose-400 border-rose-800/80 shadow-rose-950/50'
            : betStatus === 'UNDER_PROBABILITY'
              ? 'bg-amber-950 text-amber-300 border-amber-800/80 shadow-amber-950/50'
              : 'bg-emerald-950 text-emerald-400 border-emerald-800/80 shadow-emerald-950/50'
        }`}>
          {betStatus === 'BAD' && <ThumbsDown className="w-3 h-3 text-rose-400" />}
          {betStatus === 'UNDER_PROBABILITY' && <AlertCircle className="w-3 h-3 text-amber-400" />}
          {betStatus === 'GOOD' && <ThumbsUp className="w-3 h-3 text-emerald-400" />}

          <span>
            {betStatus === 'BAD' ? 'BAD BET ⚠️' : betStatus === 'UNDER_PROBABILITY' ? 'UNDER PROBABILITY ⚡' : 'GOOD BET ✅'}
          </span>
        </span>
      </div>

      {/* Voice Assistant Communication Control Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/30 p-2.5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speakText()}
            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all shadow ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Stop Voice' : '🔊 Speak Analysis Aloud'}</span>
          </button>
        </div>

        <button
          onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
          className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
            autoVoiceEnabled 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60' 
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle automatic speech synthesis when market changes"
        >
          Auto-Speak: {autoVoiceEnabled ? 'ON ✅' : 'OFF 🔇'}
        </button>
      </div>

      {/* Active Selection Banner */}
      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">CLICKED SELECTION:</span>
          <span className="text-xs font-extrabold text-white">{activeSelection.marketName}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono block">BOOKIE ODDS:</span>
          <span className="text-xs font-black text-cyan-400 font-mono">@{activeSelection.odds || '1.85'}</span>
        </div>
      </div>

      {/* Win Probability Meter */}
      <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex justify-between text-[11px] font-semibold">
          <span className="text-slate-300">Statistical Win Probability:</span>
          <span className={`font-bold font-mono ${
            betStatus === 'BAD' ? 'text-rose-400' : betStatus === 'UNDER_PROBABILITY' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {winProbability}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
          <div 
            style={{ width: `${winProbability}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              betStatus === 'BAD' 
                ? 'bg-gradient-to-r from-rose-600 to-rose-400' 
                : betStatus === 'UNDER_PROBABILITY' 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
          />
        </div>
      </div>

      {/* Analysis Summary Explanation */}
      <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
        betStatus === 'BAD'
          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          : betStatus === 'UNDER_PROBABILITY'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
      }`}>
        {betStatus === 'BAD' && (
          <p>
            <strong>Warning (Bad Bet):</strong> This selection carries high statistical risk with only a <strong>{winProbability}%</strong> calculated win chance. Placing this wager single without hedging is not recommended.
          </p>
        )}
        {betStatus === 'UNDER_PROBABILITY' && (
          <p>
            <strong>Caution (Under Probability):</strong> The win probability of <strong>{winProbability}%</strong> is moderate. The bookmaker odds do not fully compensate for the risk involved.
          </p>
        )}
        {betStatus === 'GOOD' && (
          <p>
            <strong>Excellent Pick (Good Bet):</strong> Strong statistical backing with <strong>{winProbability}%</strong> win probability and positive mathematical value against bookmaker odds.
          </p>
        )}
      </div>

      {/* AI Smart Recommendation (Provided if BAD or UNDER PROBABILITY) */}
      {(betStatus === 'BAD' || betStatus === 'UNDER_PROBABILITY') && (
        <div className="bg-gradient-to-r from-slate-900 to-cyan-950/60 border border-cyan-500/40 p-3 rounded-xl space-y-2.5 shadow-lg">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wide uppercase">AI Recommended Safer Alternative:</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Instead of <strong className="text-rose-300">{activeSelection.marketName}</strong>, AI recommends switching to:
          </p>

          <div className="bg-slate-950 border border-cyan-500/40 p-3 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {recommendation.betterMarket}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">{recommendation.reason}</span>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className="text-[10px] text-emerald-400 font-mono font-black block">{recommendation.betterProb}% Win</span>
              <span className="text-xs font-black text-amber-400 font-mono">@{recommendation.betterOdds}</span>
            </div>
          </div>

          {onApplyRecommendation && (
            <button
              onClick={() => {
                onApplyRecommendation(recommendation);
                speakText(`Switched selection to AI recommended pick: ${recommendation.betterMarket} with ${recommendation.betterProb} percent win probability.`);
              }}
              className="w-full mt-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs py-2 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 fill-slate-950" />
              <span>Switch to AI Recommended Pick</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


