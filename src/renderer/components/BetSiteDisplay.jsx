import React, { useState } from 'react';
import { Globe, Sparkles, Activity, Search, ShieldCheck, Zap, ArrowUpRight, Flame, RotateCw, ExternalLink, Info } from 'lucide-react';

const SITES = [
  {
    id: 'sportybet',
    name: 'SportyBet',
    url: 'https://www.sportybet.com/ng/',
    badge: 'NG • SportyBet Live',
    theme: {
      activeTab: 'bg-red-600 text-white border-red-500 shadow-red-900/40',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      accent: 'text-red-400'
    }
  },
  {
    id: 'bet9ja',
    name: 'Bet9ja',
    url: 'https://www.bet9ja.com/',
    badge: 'NG • Bet9ja Official',
    theme: {
      activeTab: 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      accent: 'text-emerald-400'
    }
  },
  {
    id: '1xbet',
    name: '1xBet',
    url: 'https://1xbet.com/',
    badge: 'Global • 1xBet Live',
    theme: {
      activeTab: 'bg-cyan-600 text-white border-cyan-500 shadow-cyan-900/40',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      accent: 'text-cyan-400'
    }
  }
];

const QUICK_MATCHES = [
  {
    id: 'm1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    odds: { home: 1.85, draw: 3.50, away: 4.20, over25: 1.90, btts: 1.75, dc1x: 1.25 }
  },
  {
    id: 'm2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    odds: { home: 2.10, draw: 3.40, away: 3.20, over25: 1.70, btts: 1.60, dc1x: 1.33 }
  },
  {
    id: 'm3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    league: 'Bundesliga',
    odds: { home: 1.55, draw: 4.50, away: 5.00, over25: 1.45, btts: 1.50, dc1x: 1.15 }
  },
  {
    id: 'm4',
    homeTeam: 'Enyimba FC',
    awayTeam: 'Kano Pillars',
    league: 'Nigeria NPFL',
    odds: { home: 1.70, draw: 3.10, away: 4.80, over25: 2.20, btts: 2.00, dc1x: 1.18 }
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

  const [iframeKey, setIframeKey] = useState(0);
  const activeSite = SITES.find(s => s.id === selectedSiteId) || SITES[0];

  const handleSiteChange = (site) => {
    setSelectedSiteId(site.id);
    if (onSelectSiteUrl) {
      onSelectSiteUrl(site.url);
    }
  };

  const handleReloadFrame = () => {
    setIframeKey(prev => prev + 1);
  };

  const activeUrl = currentUrl || activeSite.url;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden select-none">
      
      {/* 1. BET SITE NAVIGATION BAR */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg z-10">
        
        {/* Site Switcher Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-0.5">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1 font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bet Sites:</span>
          </span>

          {SITES.map((site) => {
            const isSelected = selectedSiteId === site.id;
            return (
              <button
                key={site.id}
                onClick={() => handleSiteChange(site)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all border flex items-center gap-2 shrink-0 ${
                  isSelected 
                    ? `${site.theme.activeTab}` 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-slate-600'}`} />
                <span>{site.name}</span>
              </button>
            );
          })}
        </div>

        {/* Address Bar & External Popout */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-xs font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[200px]">{activeUrl}</span>
          </div>

          <button
            onClick={handleReloadFrame}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reload Embedded Site"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <a
            href={activeUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            title="Open in new window"
          >
            <span>Open Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>

          <button
            onClick={onOpenOddsGenerator}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">Free Code</span>
          </button>
        </div>
      </div>

      {/* 2. EMBEDDED REAL BET SITE VIEWPORT */}
      <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden flex flex-col">
        {/* Electron Webview or Embedded Browser Frame */}
        {typeof window !== 'undefined' && (navigator.userAgent.toLowerCase().includes('electron') || window.process?.versions?.electron) ? (
          <webview
            key={iframeKey}
            src={activeUrl}
            partition="persist:betlens_session"
            preload={window.betlens?.webviewPreloadPath || ''}
            className="w-full h-full border-none"
            allowpopups="true"
          />
        ) : (
          <iframe
            key={iframeKey}
            src={activeUrl}
            title={`${activeSite.name} Live Betting Site`}
            className="w-full h-full border-none bg-slate-950"
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        )}
      </div>

      {/* 3. BOTTOM QUICK ODDS SELECTION BAR FOR LIVE BET ANALYSIS */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 z-10 shadow-2xl">
        <div className="flex items-center gap-2 shrink-0">
          <Activity className={`w-4 h-4 ${activeSite.theme.accent}`} />
          <span className="text-xs font-black text-white uppercase font-mono">Quick Bet Analyzer:</span>
          <span className="text-[10px] text-slate-400 hidden md:inline">Click any odds button below to analyze bet in side panel:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto p-1">
          {QUICK_MATCHES.map((fix) => (
            <div key={fix.id} className="bg-slate-950 border border-slate-800 p-1.5 rounded-xl flex items-center gap-2 shrink-0 text-xs">
              <span className="font-bold text-slate-200 text-[11px] px-1 font-mono">
                {fix.homeTeam} vs {fix.awayTeam}
              </span>
              
              <button
                onClick={() => onSelectBet(fix, `${fix.homeTeam} Win (1)`, fix.odds.home, 'home')}
                className="bg-slate-900 hover:bg-cyan-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-cyan-400 font-bold font-mono transition-colors"
                title={`Analyze ${fix.homeTeam} Win @ ${fix.odds.home}`}
              >
                1 @{fix.odds.home}
              </button>

              <button
                onClick={() => onSelectBet(fix, 'Over 2.5 Goals', fix.odds.over25, 'over25')}
                className="bg-slate-900 hover:bg-amber-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold font-mono transition-colors"
                title={`Analyze Over 2.5 Goals @ ${fix.odds.over25}`}
              >
                O2.5 @{fix.odds.over25}
              </button>

              <button
                onClick={() => onSelectBet(fix, `${fix.homeTeam} or Draw (1X)`, fix.odds.dc1x, 'dc1x')}
                className="bg-slate-900 hover:bg-indigo-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-indigo-400 font-bold font-mono transition-colors"
                title={`Analyze Double Chance 1X @ ${fix.odds.dc1x}`}
              >
                1X @{fix.odds.dc1x}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
