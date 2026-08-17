import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  Globe, 
  PanelRightOpen, 
  PanelRightClose, 
  History, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function BrowserChrome({ 
  currentUrl, 
  onNavigate, 
  onGoBack, 
  onGoForward, 
  onReload, 
  isSidebarOpen, 
  onToggleSidebar,
  onOpenHistory,
  bookedBetsCount
}) {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    onNavigate(target);
  };

  const presets = [
    { name: 'SportyBet', url: 'https://www.sportybet.com/ng/' },
    { name: 'Bet9ja', url: 'https://www.bet9ja.com/' },
    { name: '1xBet', url: 'https://1xbet.com/' },
    { name: 'LiveScore', url: 'https://www.livescore.com/' }
  ];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800/80 px-4 flex items-center justify-between gap-3 shadow-md z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white tracking-wider leading-none">BetLens</span>
          <span className="text-[10px] text-cyan-400 font-medium tracking-tight">Analytics Browser</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button 
          onClick={onGoBack} 
          title="Back"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={onGoForward} 
          title="Forward"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={onReload} 
          title="Reload Page"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl flex items-center">
        <div className="w-full relative flex items-center">
          <div className="absolute left-3 text-slate-500">
            <Globe className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL (e.g. sportybet.com)"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-24 py-2 focus:outline-none focus:border-cyan-500/80 transition-all font-mono"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Auth Saved
            </span>
          </div>
        </div>
      </form>

      {/* Bookmaker Fast Presets */}
      <div className="hidden xl:flex items-center gap-1.5">
        {presets.map(p => (
          <button
            key={p.name}
            onClick={() => onNavigate(p.url)}
            className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium border ${
              currentUrl.includes(p.name.toLowerCase()) 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40' 
                : 'text-slate-400 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Right Controls: History Modal & Side Panel Toggle */}
      <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
        <button
          onClick={onOpenHistory}
          className="relative p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1.5 text-xs"
          title="Saved Booked Bets"
        >
          <History className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline font-medium">Bet Log</span>
          {bookedBetsCount > 0 && (
            <span className="w-4 h-4 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              {bookedBetsCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold border ${
            isSidebarOpen 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title={isSidebarOpen ? "Collapse Sidebar" : "Open Analytics Panel"}
        >
          {isSidebarOpen ? <PanelRightClose className="w-4 h-4 text-cyan-400" /> : <PanelRightOpen className="w-4 h-4" />}
          <span>Analytics</span>
        </button>
      </div>
    </header>
  );
}
