import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RefreshCw, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import ticketEngine from '../../services/ticket-generator-engine';

export default function DailyBestFitsCard({ onSelectMatch }) {
  const [bestFits, setBestFits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    ticketEngine.getTodayBestFits().then((fits) => {
      if (isMounted) {
        setBestFits(fits || []);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    ticketEngine.getTodayBestFits().then((fits) => {
      setBestFits(fits || []);
      setIsLoading(false);
    });
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg">
            🔥
          </div>
          <div>
            <h3 className="font-black text-base text-white font-mono flex items-center gap-2">
              <span>TODAY'S BEST STATISTICAL FITS</span>
              <span className="text-xs text-amber-400 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                Top 10 Auto-Scan
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Auto-scanned today's daily matches for the highest statistical confidence scores.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Refresh Best Fits"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400 font-mono">Auto-scanning today's fixtures...</span>
        </div>
      ) : bestFits.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 font-mono">
          No matches currently meet the top statistical fit threshold for today.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bestFits.map((fit, idx) => (
            <div
              key={idx}
              onClick={() => onSelectMatch && onSelectMatch(fit.fixture)}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black font-mono text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {fit.fixture.homeTeam?.name || fit.fixture.homeTeam} vs {fit.fixture.awayTeam?.name || fit.fixture.awayTeam}
                  </h4>
                  <span className="text-[11px] text-cyan-400 font-mono">{fit.marketTitle} (@{fit.odds})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800">
                  {fit.betlensScore}/100
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
