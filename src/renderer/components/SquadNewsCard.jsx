import React from 'react';
import { Stethoscope, Info } from 'lucide-react';

export default function SquadNewsCard({ squadNews, homeTeam, awayTeam }) {
  if (!squadNews) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Player & Squad Availability</h4>
      </div>

      {squadNews.notice ? (
        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{squadNews.notice}</span>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          {/* Injured/Suspended Player List if present */}
          {squadNews.injuries && squadNews.injuries.length > 0 ? (
            <div className="space-y-1">
              {squadNews.injuries.map((inj, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800/60 p-2 rounded-md flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{inj.player}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{inj.team} • {inj.reason || inj.type}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    {inj.type || 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-mono">No confirmed injury or suspension reports from current data feed.</p>
          )}
        </div>
      )}
    </div>
  );
}

