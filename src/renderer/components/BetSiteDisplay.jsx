import React, { useState } from 'react';
import { Globe, Sparkles, Activity, Search, ShieldCheck, Zap, ArrowUpRight, Flame, Trophy } from 'lucide-react';

const SITES = [
  {
    id: 'sportybet',
    name: 'SportyBet',
    url: 'https://www.sportybet.com/ng/',
    badge: 'NG • SportyBet Live',
    theme: {
      activeTab: 'bg-red-600 text-white border-red-500 shadow-red-900/30',
      headerGradient: 'from-red-950/80 via-slate-900 to-slate-950 border-red-800/40',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      buttonHover: 'hover:bg-red-950 hover:border-red-500/60 text-red-400',
      accent: 'text-red-400',
      borderAccent: 'border-red-500/50'
    }
  },
  {
    id: 'bet9ja',
    name: 'Bet9ja',
    url: 'https://www.bet9ja.com/',
    badge: 'NG • Bet9ja Official',
    theme: {
      activeTab: 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30',
      headerGradient: 'from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-800/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      buttonHover: 'hover:bg-emerald-950 hover:border-emerald-500/60 text-emerald-400',
      accent: 'text-emerald-400',
      borderAccent: 'border-emerald-500/50'
    }
  },
  {
    id: '1xbet',
    name: '1xBet',
    url: 'https://1xbet.com/',
    badge: 'Global • 1xBet Live',
    theme: {
      activeTab: 'bg-cyan-600 text-white border-cyan-500 shadow-cyan-900/30',
      headerGradient: 'from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-800/40',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      buttonHover: 'hover:bg-cyan-950 hover:border-cyan-500/60 text-cyan-400',
      accent: 'text-cyan-400',
      borderAccent: 'border-cyan-500/50'
    }
  }
];

const FIXTURES_DATA = [
  {
    id: 'm1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    matchTime: 'Today 20:00',
    hotPick: 'Over 1.5 Goals @1.32',
    odds: { home: 1.85, draw: 3.50, away: 4.20, over25: 1.90, btts: 1.75, dc1x: 1.25, dcx2: 1.90 }
  },
  {
    id: 'm2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    matchTime: 'Today 21:00',
    hotPick: 'BTTS Yes @1.60',
    odds: { home: 2.10, draw: 3.40, away: 3.20, over25: 1.70, btts: 1.60, dc1x: 1.33, dcx2: 1.65 }
  },
  {
    id: 'm3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    league: 'Bundesliga',
    matchTime: 'Tomorrow 17:30',
    hotPick: 'Bayern Win @1.55',
    odds: { home: 1.55, draw: 4.50, away: 5.00, over25: 1.45, btts: 1.50, dc1x: 1.15, dcx2: 2.30 }
  },
  {
    id: 'm4',
    homeTeam: 'Inter Milan',
    awayTeam: 'Juventus',
    league: 'Serie A',
    matchTime: 'Tomorrow 19:45',
    hotPick: 'Under 2.5 Goals @1.75',
    odds: { home: 1.95, draw: 3.25, away: 3.80, over25: 2.05, btts: 1.85, dc1x: 1.26, dcx2: 1.82 }
  },
  {
    id: 'm5',
    homeTeam: 'Enyimba FC',
    awayTeam: 'Kano Pillars',
    league: 'Nigeria NPFL',
    matchTime: 'Today 16:00',
    hotPick: 'Home Win @1.70',
    odds: { home: 1.70, draw: 3.10, away: 4.80, over25: 2.20, btts: 2.00, dc1x: 1.18, dcx2: 2.05 }
  },
  {
    id: 'm6',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    matchTime: 'Sunday 16:30',
    hotPick: 'Over 2.5 Goals @1.65',
    odds: { home: 2.00, draw: 3.60, away: 3.40, over25: 1.65, btts: 1.55, dc1x: 1.30, dcx2: 1.72 }
  }
];

export default function BetSiteDisplay({ 
  currentUrl, 
  onSelectSiteUrl, 
  onSelectBet, 
  onOpenOddsGenerator 
}) {
  const [selectedSiteId, setSelectedSiteId] = useState(() => {
    if (currentUrl?.includes('bet9ja')) return 'bet9ja';
    if (currentUrl?.includes('1xbet')) return '1xbet';
    return 'sportybet';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('ALL');

  const activeSite = SITES.find(s => s.id === selectedSiteId) || SITES[0];

  const handleSiteChange = (site) => {
    setSelectedSiteId(site.id);
    if (onSelectSiteUrl) {
      onSelectSiteUrl(site.url);
    }
  };

  const filteredFixtures = FIXTURES_DATA.filter((fix) => {
    const matchesSearch = 
      fix.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.league.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedLeagueFilter === 'ALL') return matchesSearch;
    return matchesSearch && fix.league === selectedLeagueFilter;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-y-auto p-4 md:p-6 space-y-6 select-none">
      
      {/* 1. BET SITE SELECTOR BAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl shrink-0">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1 font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Bet Site:</span>
          </span>

          {SITES.map((site) => {
            const isSelected = selectedSiteId === site.id;
            return (
              <button
                key={site.id}
                onClick={() => handleSiteChange(site)}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all border flex items-center gap-2 shrink-0 ${
                  isSelected 
                    ? `${site.theme.activeTab} shadow-lg` 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-slate-600'}`} />
                <span>{site.name}</span>
                {isSelected && (
                  <span className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded font-mono font-normal">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenOddsGenerator}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Generate Free Ticket</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE BET SITE HERO DISPLAY BANNER */}
      <div className={`bg-gradient-to-r ${activeSite.theme.headerGradient} border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl shrink-0 relative overflow-hidden transition-all duration-500`}>
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-lg shadow-xl ${activeSite.theme.badgeColor}`}>
            {activeSite.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-wide">
                {activeSite.name} Display & Odds Matrix
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${activeSite.theme.badgeColor}`}>
                {activeSite.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Click ANY match or odds option below to run instant AI Poisson probability model & test if the bet is <strong className="text-emerald-400">Good</strong>, <strong className="text-rose-400">Bad</strong>, or <strong className="text-amber-400">Under Probability</strong>!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <a
            href={activeSite.url}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow"
          >
            <span>Open {activeSite.name} Site</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* 3. CONTROLS: SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSite.name} matches...`}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500/80 transition-all font-mono"
          />
        </div>

        {/* League Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-0.5">
          {['ALL', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Nigeria NPFL'].map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeagueFilter(league)}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all border shrink-0 ${
                selectedLeagueFilter === league
                  ? `${activeSite.theme.badgeColor} shadow`
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {league === 'ALL' ? '🏆 All Leagues' : league}
            </button>
          ))}
        </div>
      </div>

      {/* 4. LIVE MATCH FIXTURES & INTERACTIVE ODDS SELECTION MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className={`w-4 h-4 ${activeSite.theme.accent}`} />
            <span>{activeSite.name} Live Fixtures & Odds Selection Area</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any bet button to view analysis in sidebar
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredFixtures.map((fix) => (
            <div
              key={fix.id}
              className={`bg-slate-900/90 border border-slate-800/90 ${activeSite.theme.buttonHover} p-4 rounded-xl shadow-lg transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group`}
            >
              {/* Match Header Information */}
              <div 
                className="space-y-1.5 cursor-pointer flex-1"
                onClick={() => onSelectBet(fix, `${fix.homeTeam} Win (1)`, fix.odds.home, 'home')}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${activeSite.theme.badgeColor}`}>
                    {fix.league}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{fix.matchTime}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {fix.hotPick}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <span>{fix.homeTeam}</span>
                  <span className="text-slate-500 font-normal text-xs">vs</span>
                  <span>{fix.awayTeam}</span>
                </h4>
              </div>

              {/* Interactive Odds Selection Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
                {/* 1 - Home Win */}
                <button
                  onClick={() => onSelectBet(fix, `${fix.homeTeam} Win (1)`, fix.odds.home, 'home')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-cyan-950/80 hover:border-cyan-500/60 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all group/btn"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">1 (Home)</span>
                  <span className="text-xs font-extrabold text-cyan-400 font-mono">@{fix.odds.home}</span>
                </button>

                {/* X - Draw */}
                <button
                  onClick={() => onSelectBet(fix, 'Draw (X)', fix.odds.draw, 'draw')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-slate-800 hover:border-slate-600 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">X (Draw)</span>
                  <span className="text-xs font-extrabold text-slate-200 font-mono">@{fix.odds.draw}</span>
                </button>

                {/* 2 - Away Win */}
                <button
                  onClick={() => onSelectBet(fix, `${fix.awayTeam} Win (2)`, fix.odds.away, 'away')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-rose-950/80 hover:border-rose-500/60 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">2 (Away)</span>
                  <span className="text-xs font-extrabold text-rose-400 font-mono">@{fix.odds.away}</span>
                </button>

                {/* Over 2.5 */}
                <button
                  onClick={() => onSelectBet(fix, 'Over 2.5 Goals', fix.odds.over25, 'over25')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-amber-950/80 hover:border-amber-500/60 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">Over 2.5</span>
                  <span className="text-xs font-extrabold text-amber-400 font-mono">@{fix.odds.over25}</span>
                </button>

                {/* BTTS */}
                <button
                  onClick={() => onSelectBet(fix, 'Both Teams To Score', fix.odds.btts, 'btts')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-emerald-950/80 hover:border-emerald-500/60 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">BTTS Yes</span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">@{fix.odds.btts}</span>
                </button>

                {/* Double Chance 1X */}
                <button
                  onClick={() => onSelectBet(fix, `${fix.homeTeam} or Draw (1X)`, fix.odds.dc1x, 'dc1x')}
                  className="flex-1 lg:flex-none bg-slate-950 hover:bg-indigo-950/80 hover:border-indigo-500/60 border border-slate-800 px-3 py-2 rounded-xl text-center transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-mono block">1X (Safe)</span>
                  <span className="text-xs font-extrabold text-indigo-400 font-mono">@{fix.odds.dc1x}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
