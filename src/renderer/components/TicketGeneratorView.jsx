import React, { useState } from 'react';
import { Sparkles, Calendar, Target, ShieldCheck, RefreshCw, AlertTriangle, Copy, Check, Bookmark, Layers, TrendingUp, HelpCircle, Activity } from 'lucide-react';
import ticketEngine from '../../services/ticket-generator-engine';

export default function TicketGeneratorView({ onSelectMatchForAnalysis }) {
  // Control States
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateCategory, setDateCategory] = useState('today'); // 'today', 'tomorrow', 'custom', 'historical'
  const [ticketMode, setTicketMode] = useState('single'); // 'single', 'mixed', 'custom'
  const [singleMarketKey, setSingleMarketKey] = useState('goals_over15');
  const [allowedMarkets, setAllowedMarkets] = useState(['goals_over15', 'goals_over25', 'btts_yes', 'double_chance_1x']);
  const [minOdds, setMinOdds] = useState('5.00');
  const [maxOdds, setMaxOdds] = useState('10.00');
  const [selectionsCount, setSelectionsCount] = useState('5');
  const [riskProfile, setRiskProfile] = useState('conservative'); // 'conservative', 'balanced', 'aggressive'
  const [minScore, setMinScore] = useState('75');

  // Execution & Progress States
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'safer', 'higher'
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getRelativeDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const handleDateCategoryChange = (cat) => {
    setDateCategory(cat);
    if (cat === 'today') setSelectedDate(getRelativeDate(0));
    else if (cat === 'tomorrow') setSelectedDate(getRelativeDate(1));
    else if (cat === 'historical') setSelectedDate(getRelativeDate(-1));
  };

  const toggleCustomMarket = (mKey) => {
    setAllowedMarkets(prev =>
      prev.includes(mKey) ? prev.filter(k => k !== mKey) : [...prev, mKey]
    );
  };

  const handleGenerateTicket = async () => {
    setIsScanning(true);
    setGeneratedResult(null);
    setIsSaved(false);

    const result = await ticketEngine.scanAndGenerateTicket(
      {
        date: selectedDate,
        ticketMode,
        singleMarketKey,
        allowedMarkets,
        minOdds,
        maxOdds,
        selectionsCount,
        riskProfile,
        minScore
      },
      (stepText) => setScanStepText(stepText)
    );

    setGeneratedResult(result);
    setIsScanning(false);
    setActiveTab('main');
  };

  const handleSaveTicket = () => {
    if (!generatedResult || !generatedResult.success) return;
    ticketEngine.saveTicket(generatedResult);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyTicket = () => {
    if (!generatedResult || !generatedResult.selections) return;
    const text = generatedResult.selections
      .map((s, i) => `${i + 1}. ${s.homeTeam} vs ${s.awayTeam} → ${s.marketTitle} (@${s.odds}) [Score: ${s.betlensScore}]`)
      .join('\n');
    navigator.clipboard.writeText(`BETLENS AI TICKET (${generatedResult.combinedOdds} Total Odds)\n${text}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Determine active displayed ticket
  const currentTicket = activeTab === 'safer'
    ? generatedResult?.alternativeTickets?.safer
    : activeTab === 'higher'
      ? generatedResult?.alternativeTickets?.higherOdds
      : generatedResult;

  const currentSelections = currentTicket?.selections || [];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* LEFT CONTROL PANEL: TICKET CONFIGURATION (Requirements 1-9) */}
      <div className="w-full lg:w-[450px] h-full bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col space-y-4 overflow-y-auto shrink-0 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 to-cyan-950/80 p-3.5 rounded-2xl border border-cyan-500/30">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white tracking-wide">
              BETLENS AI TICKET GENERATOR
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Configure parameters to scan and build optimal statistical tickets.
            </p>
          </div>
        </div>

        {/* 1. MATCH DATE SELECTION */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[11px] font-extrabold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Match Date Period</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDateCategoryChange('today')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                dateCategory === 'today' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🔥 Today
            </button>
            <button
              onClick={() => handleDateCategoryChange('tomorrow')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                dateCategory === 'tomorrow' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => handleDateCategoryChange('custom')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                dateCategory === 'custom' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Custom Date
            </button>
            <button
              onClick={() => handleDateCategoryChange('historical')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                dateCategory === 'historical' ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Previous Games
            </button>
          </div>

          {dateCategory === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono mt-2"
            />
          )}

          {dateCategory === 'historical' && (
            <p className="text-[10px] text-amber-400/90 font-mono leading-tight pt-1">
              * Note: Historical matches are analyzed for backtesting and model evaluation.
            </p>
          )}
        </div>

        {/* 2. TICKET MARKET TYPE */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[11px] font-extrabold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. Ticket Market Mode</span>
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setTicketMode('single')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                ticketMode === 'single' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Single Market
            </button>
            <button
              onClick={() => setTicketMode('mixed')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                ticketMode === 'mixed' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Mixed Markets
            </button>
            <button
              onClick={() => setTicketMode('custom')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                ticketMode === 'custom' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Custom Enabled
            </button>
          </div>

          {/* Single Market Dropdown */}
          {ticketMode === 'single' && (
            <select
              value={singleMarketKey}
              onChange={(e) => setSingleMarketKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono mt-1"
            >
              <option value="goals_over15">Over 1.5 Goals</option>
              <option value="goals_over25">Over 2.5 Goals</option>
              <option value="goals_under25">Under 2.5 Goals</option>
              <option value="btts_yes">Both Teams To Score (BTTS)</option>
              <option value="match_result_home">Home Win (1)</option>
              <option value="double_chance_1x">Double Chance (1X)</option>
              <option value="corners_over">Over 8.5 Corners</option>
              <option value="cards_over">Over 3.5 Cards</option>
            </select>
          )}

          {/* Custom Market Checkboxes */}
          {ticketMode === 'custom' && (
            <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-xs">
              {[
                { key: 'goals_over15', label: 'Over 1.5 Goals' },
                { key: 'goals_over25', label: 'Over 2.5 Goals' },
                { key: 'btts_yes', label: 'BTTS (Yes)' },
                { key: 'double_chance_1x', label: 'Double Chance 1X' },
                { key: 'match_result_home', label: 'Home Win (1)' },
                { key: 'corners_over', label: 'Over 8.5 Corners' }
              ].map(m => (
                <label key={m.key} className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowedMarkets.includes(m.key)}
                    onChange={() => toggleCustomMarket(m.key)}
                    className="accent-cyan-400"
                  />
                  <span className={allowedMarkets.includes(m.key) ? 'text-cyan-300 font-bold' : 'text-slate-400'}>{m.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 3. TARGET TOTAL ODDS & SELECTION COUNT */}
        <div className="grid grid-cols-2 gap-3">
          {/* Target Total Odds */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">
              Target Total Odds Range
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                value={minOdds}
                onChange={(e) => setMinOdds(e.target.value)}
                placeholder="Min"
                className="w-full bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-slate-600 font-mono text-xs">-</span>
              <input
                type="number"
                step="0.5"
                value={maxOdds}
                onChange={(e) => setMaxOdds(e.target.value)}
                placeholder="Max"
                className="w-full bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Number of Selections */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">
              Selections Count
            </label>
            <select
              value={selectionsCount}
              onChange={(e) => setSelectionsCount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="3">3 Selections</option>
              <option value="5">5 Selections</option>
              <option value="8">8 Selections</option>
              <option value="10">10 Selections</option>
            </select>
          </div>
        </div>

        {/* 4. RISK PROFILE & MINIMUM BETLENS SCORE */}
        <div className="grid grid-cols-2 gap-3">
          {/* Risk Profile */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">
              Risk Profile
            </label>
            <select
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="conservative">🟢 Conservative</option>
              <option value="balanced">🟡 Balanced</option>
              <option value="aggressive">🔴 Aggressive</option>
            </select>
          </div>

          {/* Minimum BetLens Score */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">
              Min BetLens Score
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-emerald-300 font-bold text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="60">60+ (Moderate)</option>
              <option value="70">70+ (Strong)</option>
              <option value="75">75+ (High)</option>
              <option value="80">80+ (Very Strong)</option>
            </select>
          </div>
        </div>

        {/* GENERATE TICKET PRIMARY ACTION BUTTON */}
        <button
          onClick={handleGenerateTicket}
          disabled={isScanning}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 font-mono disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Scanning Fixtures...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>GENERATE AI TICKET</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT DISPLAY PANEL: GENERATED TICKET & ANALYSIS (Requirements 10-21) */}
      <div className="flex-1 h-full bg-slate-950 p-5 flex flex-col space-y-4 overflow-y-auto">
        
        {isScanning ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative shadow-xl">
              <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-cyan-400 absolute" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white font-mono">Scanning Fixtures & Building Ticket...</h4>
              <p className="text-xs text-cyan-400 font-mono animate-pulse">{scanStepText}</p>
            </div>
          </div>
        ) : !generatedResult ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-extrabold text-slate-200">Configure ticket rules & click Generate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                BetLens will scan live fixtures, analyze statistical trends, filter out risky matches, and output an evidence-based ticket.
              </p>
            </div>
          </div>
        ) : !generatedResult.success ? (
          <div className="py-16 p-6 bg-rose-950/40 border border-rose-800/80 rounded-3xl text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-sm font-bold text-rose-300">Unable to generate ticket matching rules</h4>
            <p className="text-xs text-slate-300 font-mono">{generatedResult.error}</p>
            <p className="text-xs text-slate-400">Try lowering the Minimum BetLens Score or expanding the allowed markets.</p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* 1. TICKET HEADER SUMMARY BAR (Requirement 18) */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/40 p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2.5 py-0.5 rounded border border-cyan-500/40">
                    {generatedResult.overallAssessment}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{generatedResult.date}</span>
                </div>
                <h3 className="font-black text-xl text-white font-mono flex items-center gap-2">
                  <span>BETLENS AI TICKET</span>
                  <span className="text-xs text-cyan-400 font-normal">({currentSelections.length} Selections)</span>
                </h3>
              </div>

              {/* Combined Odds & Score Gauges */}
              <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Combined Odds</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">@{currentTicket?.combinedOdds}</span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Avg Score</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{currentTicket?.avgScore}<span className="text-xs font-normal text-slate-500">/100</span></span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Data Quality</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{generatedResult.avgDataQuality}<span className="text-xs font-normal text-slate-500">%</span></span>
                </div>
              </div>
            </div>

            {/* Insufficient Matches Notice if applicable (Requirement 15) */}
            {generatedResult.isInsufficientMatches && (
              <div className="bg-amber-950/60 border border-amber-800/80 p-3.5 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{generatedResult.insufficientNotice}</span>
              </div>
            )}

            {/* Correlation Warnings if applicable (Requirement 17) */}
            {generatedResult.correlationWarnings?.length > 0 && (
              <div className="space-y-1">
                {generatedResult.correlationWarnings.map((warn, i) => (
                  <div key={i} className="bg-indigo-950/60 border border-indigo-800/80 p-3 rounded-xl text-xs text-indigo-300 font-mono flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ALTERNATIVE TICKET VARIANTS TABS (Requirement 21) */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('main')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border font-mono ${
                  activeTab === 'main'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🎯 Primary Ticket ({generatedResult.actualSelectionsCount} Picks | @{generatedResult.combinedOdds})
              </button>

              <button
                onClick={() => setActiveTab('safer')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border font-mono ${
                  activeTab === 'safer'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🛡 Safer Ticket ({generatedResult.alternativeTickets?.safer?.selectionsCount} Picks | @{generatedResult.alternativeTickets?.safer?.combinedOdds})
              </button>

              <button
                onClick={() => setActiveTab('higher')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border font-mono ${
                  activeTab === 'higher'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🚀 Higher Odds Ticket ({generatedResult.alternativeTickets?.higherOdds?.selectionsCount} Picks | @{generatedResult.alternativeTickets?.higherOdds?.combinedOdds})
              </button>
            </div>

            {/* SELECTION CARDS LIST (Requirement 18 & 19) */}
            <div className="space-y-3">
              {currentSelections.map((sel, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-4 shadow-xl space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-white">{sel.homeTeam} vs {sel.awayTeam}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{sel.league}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                        Market: <strong className="text-cyan-400">{sel.marketTitle}</strong>
                      </span>
                      <span className="text-xs bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/80 text-cyan-300 font-black">
                        @{sel.odds}
                      </span>
                    </div>
                  </div>

                  {/* BetLens Score & Reasons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">WHY BETLENS SELECTED THIS</span>
                      {sel.whyBullets?.slice(0, 2).map((bullet, bi) => (
                        <div key={bi} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-cyan-400 font-bold">✓</span>
                          <span className="leading-snug">{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">BetLens Fit Score</span>
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">{sel.betlensScore}/100</span>
                      </div>
                      {sel.riskFactors?.length > 0 && (
                        <div className="text-[11px] text-amber-300/90 pt-1 leading-snug">
                          ⚠ {sel.riskFactors[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TICKET SUMMARY & ACTIONS (Requirements 20 & 22) */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
              <div className="space-y-1 text-xs text-slate-300">
                <div>Strongest Selection: <strong className="text-cyan-400">{generatedResult.strongestSelection?.homeTeam} vs {generatedResult.strongestSelection?.awayTeam} ({generatedResult.strongestSelection?.marketTitle})</strong></div>
                <div>Overall Assessment: <strong className="text-emerald-400">{generatedResult.overallAssessment}</strong></div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTicket}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Ticket Text'}</span>
                </button>

                <button
                  onClick={handleSaveTicket}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg"
                >
                  {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Bookmark className="w-4 h-4 fill-slate-950" />}
                  <span>{isSaved ? 'Ticket Saved!' : 'Save Ticket'}</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
