import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function FormBadge({ teamName, form, isHome }) {
  if (!form || !form.matches) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isHome ? 'bg-cyan-400' : 'bg-rose-400'}`} />
          {teamName} Form (Last 5)
        </span>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {form.pts} Pts
        </span>
      </div>

      {/* Badges series */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          {form.matches.map((m, idx) => {
            const isWin = m.result === 'W';
            const isDraw = m.result === 'D';
            return (
              <div 
                key={idx}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm font-mono border ${
                  isWin 
                    ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20' 
                    : isDraw 
                    ? 'bg-slate-600 border-slate-500' 
                    : 'bg-rose-600 border-rose-500 shadow-rose-500/20'
                }`}
                title={`${m.isHome ? 'Home' : 'Away'} vs ${m.opponent} (${m.score})`}
              >
                {m.result}
              </div>
            );
          })}
        </div>

        {/* Goals ratio */}
        <div className="text-right text-[10px] text-slate-400 font-mono">
          <span className="text-emerald-400 font-bold">
            {form.matches.reduce((acc, m) => acc + m.teamScore, 0)} GF
          </span>
          <span className="mx-1">/</span>
          <span className="text-rose-400 font-bold">
            {form.matches.reduce((acc, m) => acc + m.oppScore, 0)} GA
          </span>
        </div>
      </div>
    </div>
  );
}
