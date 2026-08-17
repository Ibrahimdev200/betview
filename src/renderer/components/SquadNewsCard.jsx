import React from 'react';
import { UserCheck, AlertTriangle, Stethoscope } from 'lucide-react';

export default function SquadNewsCard({ squadNews, homeTeam, awayTeam }) {
  if (!squadNews) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Squad & Injury News</h4>
      </div>

      <div className="space-y-2 text-xs">
        {/* Home News */}
        {squadNews.home && squadNews.home.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{homeTeam} Updates</span>
            <div className="space-y-1">
              {squadNews.home.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800/60 p-2 rounded-md flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 ${item.status === 'Fit' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div>
                    <span className="font-semibold text-slate-200">{item.player}</span>
                    <span className={`ml-2 text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      item.status === 'Fit' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>{item.status}</span>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Away News */}
        {squadNews.away && squadNews.away.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{awayTeam} Updates</span>
            <div className="space-y-1">
              {squadNews.away.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800/60 p-2 rounded-md flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 ${item.status === 'Fit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <div>
                    <span className="font-semibold text-slate-200">{item.player}</span>
                    <span className={`ml-2 text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      item.status === 'Fit' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>{item.status}</span>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
