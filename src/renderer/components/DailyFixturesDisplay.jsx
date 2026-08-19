import React, { useState, useEffect } from 'react';
import { Calendar, Search, Activity, Sparkles, RefreshCw, Trophy, ShieldCheck, Radio, Clock, ChevronRight } from 'lucide-react';
import apiFootballService from '../api-football-service';

export default function DailyFixturesDisplay({ 
  selectedMatchId,
  onSelectMatch,
  onSelectBet, 
  onOpenOddsGenerator 
}) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fixtures, setFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiFootballService.getDailyFixtures(selectedDate).then((list) => {
      if (isMounted) {
        setFixtures(list || []);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const handleRefresh = () => {
    setIsLoading(true);
    apiFootballService.getDailyFixtures(selectedDate).then((list) => {
      setFixtures(list || []);
      setIsLoading(false);
    });
  };

  const handleMatchSelection = (fix, marketName, oddsVal, marketType) => {
    const homeName = fix.homeTeam?.name || fix.homeTeam;
    const defaultMarketName = marketName || `${homeName} Win (1)`;
    const defaultOdds = oddsVal || fix.odds?.home;
    const defaultType = marketType || 'home';

    if (typeof onSelectMatch === 'function') {
      onSelectMatch(fix, defaultMarketName, defaultOdds, defaultType);
    } else if (typeof onSelectBet === 'function') {
      onSelectBet(
        { homeTeam: fix.homeTeam.name, awayTeam: fix.awayTeam.name, league: fix.league.name, odds: fix.odds },
        defaultMarketName,
        defaultOdds,
        defaultType
      );
    }
  };

  const getRelativeDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const yesterdayStr = getRelativeDate(-1);
  const todayStr = getRelativeDate(0);
  const tomorrowStr = getRelativeDate(1);

  const filteredFixtures = fixtures.filter((fix) => {
    const matchesSearch =
      fix.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.league.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedLeague === 'ALL') return matchesSearch;
    if (selectedLeague === 'LIVE') return matchesSearch && (fix.status === '1H' || fix.status === '2H' || fix.status === 'HT');
    return matchesSearch && (fix.league.name.toLowerCase().includes(selectedLeague.toLowerCase()));
  });

  const popularLeagues = ['ALL', 'LIVE', 'Premier League', 'La Liga', 'UEFA Champions League', 'Serie A', 'Bundesliga', 'Ligue 1'];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-y-auto p-4 md:p-6 space-y-5 select-none">
      
      {/* 1. HEADER HERO BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-950 border border-cyan-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl shrink-0 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-wide">
                Sportsbook Football Matches & Market Odds
              </h3>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                API-Football v3 Live
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time daily matches. Click <strong className="text-cyan-400">[Analyze Match]</strong> or any market odds button to evaluate win probability in the side panel.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 z-10 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Daily Fixtures"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onOpenOddsGenerator}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Generate Free Ticket</span>
          </button>
        </div>
      </div>

      {/* 2. DATE SELECTOR & SEARCH FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto p-0.5">
          <span className="text-[11px] font-mono text-slate-400 font-bold px-2 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Date:</span>
          </span>

          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              selectedDate === yesterdayStr
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border shrink-0 ${
              selectedDate === todayStr
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🔥 Today ({todayStr})
          </button>

          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              selectedDate === tomorrowStr
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Tomorrow
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or leagues..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* 3. LEAGUE CATEGORY TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {popularLeagues.map((lg) => (
          <button
            key={lg}
            onClick={() => setSelectedLeague(lg)}
            className={`text-[11px] px-3 py-1.5 rounded-xl font-extrabold transition-all border shrink-0 flex items-center gap-1 ${
              selectedLeague === lg
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:text-white'
            }`}
          >
            {lg === 'LIVE' && <Radio className="w-3 h-3 text-rose-400 animate-pulse" />}
            {lg === 'ALL' ? '🏆 All Matches' : lg}
          </button>
        ))}
      </div>

      {/* 4. FIXTURES GRID & BOOKMAKER MATCH CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Football Matches ({filteredFixtures.length} Games)</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Click [Analyze Match] or any odds button to open BetLens analysis
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-bold text-slate-400">Loading API-Football Daily Games...</span>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Fixtures Found</h4>
            <p className="text-xs text-slate-500">No matches found for date {selectedDate} matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFixtures.map((fix) => {
              const kickoffTimeStr = new Date(fix.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isLive = fix.status === '1H' || fix.status === '2H' || fix.status === 'HT';
              const isSelected = selectedMatchId && String(selectedMatchId) === String(fix.id);

              return (
                <div
                  key={fix.id}
                  onClick={() => handleMatchSelection(fix)}
                  className={`p-4.5 rounded-2xl transition-all cursor-pointer flex flex-col space-y-3 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-2 border-cyan-400 ring-2 ring-cyan-500/40 shadow-2xl shadow-cyan-500/20'
                      : 'bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 shadow-xl'
                  }`}
                >
                  {/* Top Bar: League Name, Live/Kickoff Time & Analyze CTA */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-800/60 font-mono truncate">
                        {fix.league.name}
                      </span>

                      {isLive ? (
                        <span className="text-[10px] font-black text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded font-mono animate-pulse flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-rose-400" />
                          LIVE {fix.elapsed}'
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {kickoffTimeStr}
                        </span>
                      )}
                    </div>

                    {/* Primary [Analyze Match] CTA Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/40 font-mono hidden sm:inline-block">
                          ✓ Selected
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMatchSelection(fix);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow font-mono ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                            : 'bg-slate-800 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950 hover:text-cyan-300'
                        }`}
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Teams & Crests & Score */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className={`font-extrabold text-sm md:text-base transition-colors text-right truncate ${isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-400'}`}>
                        {fix.homeTeam.name}
                      </span>
                      {fix.homeTeam.logo ? (
                        <img src={fix.homeTeam.logo} alt={fix.homeTeam.name} className="w-7 h-7 object-contain shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {fix.homeTeam.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* VS / Score Badge */}
                    <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-center shrink-0 shadow-inner">
                      {fix.goals.home !== null ? (
                        <span className="font-black text-sm md:text-base text-emerald-400 font-mono">
                          {fix.goals.home} - {fix.goals.away}
                        </span>
                      ) : (
                        <span className="text-xs font-black text-slate-400 font-mono">VS</span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-start">
                      {fix.awayTeam.logo ? (
                        <img src={fix.awayTeam.logo} alt={fix.awayTeam.name} className="w-7 h-7 object-contain shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {fix.awayTeam.name.charAt(0)}
                        </div>
                      )}
                      <span className={`font-extrabold text-sm md:text-base transition-colors truncate ${isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-400'}`}>
                        {fix.awayTeam.name}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Bookmaker Market Odds Grid (6 Columns - Guaranteed Visibility) */}
                  <div className="pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                      {/* 1 - Home Win */}
                      <button
                        onClick={() => handleMatchSelection(fix, `${fix.homeTeam.name} Win (1)`, fix.odds.home, 'match_result_home')}
                        className="bg-slate-950 hover:bg-cyan-950 hover:border-cyan-500/60 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">1 (Home)</span>
                        <span className="text-xs font-black text-cyan-400 font-mono mt-0.5">@{fix.odds.home}</span>
                      </button>

                      {/* X - Draw */}
                      <button
                        onClick={() => handleMatchSelection(fix, 'Draw (X)', fix.odds.draw, 'match_result_draw')}
                        className="bg-slate-950 hover:bg-slate-800 hover:border-slate-600 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">X (Draw)</span>
                        <span className="text-xs font-black text-slate-200 font-mono mt-0.5">@{fix.odds.draw}</span>
                      </button>

                      {/* 2 - Away Win */}
                      <button
                        onClick={() => handleMatchSelection(fix, `${fix.awayTeam.name} Win (2)`, fix.odds.away, 'match_result_away')}
                        className="bg-slate-950 hover:bg-rose-950 hover:border-rose-500/60 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">2 (Away)</span>
                        <span className="text-xs font-black text-rose-400 font-mono mt-0.5">@{fix.odds.away}</span>
                      </button>

                      {/* Over 2.5 */}
                      <button
                        onClick={() => handleMatchSelection(fix, 'Over 2.5 Goals', fix.odds.over25, 'goals_over25')}
                        className="bg-slate-950 hover:bg-amber-950 hover:border-amber-500/60 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">Over 2.5</span>
                        <span className="text-xs font-black text-amber-400 font-mono mt-0.5">@{fix.odds.over25}</span>
                      </button>

                      {/* BTTS */}
                      <button
                        onClick={() => handleMatchSelection(fix, 'Both Teams To Score', fix.odds.btts, 'btts_yes')}
                        className="bg-slate-950 hover:bg-emerald-950 hover:border-emerald-500/60 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">BTTS</span>
                        <span className="text-xs font-black text-emerald-400 font-mono mt-0.5">@{fix.odds.btts}</span>
                      </button>

                      {/* 1X - Double Chance */}
                      <button
                        onClick={() => handleMatchSelection(fix, `${fix.homeTeam.name} or Draw (1X)`, fix.odds.dc1x, 'double_chance_1x')}
                        className="bg-slate-950 hover:bg-indigo-950 hover:border-indigo-500/60 border border-slate-800 px-2 py-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">1X (Safe)</span>
                        <span className="text-xs font-black text-indigo-400 font-mono mt-0.5">@{fix.odds.dc1x}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
