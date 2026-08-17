import React from 'react';
import { History, Swords } from 'lucide-react';

export default function H2HCard({ h2h, homeTeam, awayTeam }) {
  if (!h2h || !Array.isArray(h2h) || h2h.length === 0) return null;

  const homeWins = h2h.filter(m => m.winner === 'home').length;
  const awayWins = h2h.filter(m => m.winner === 'away').length;
  const draws = h2h.filter(m => m.winner === 'draw').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      {/* Title & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Head to Head History</h4>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-cyan-400 font-bold">{homeWins}W</span>
          <span>-</span>
          <span className="text-slate-400 font-bold">{draws}D</span>
          <span>-</span>
          <span className="text-rose-400 font-bold">{awayWins}W</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-1.5 pt-1">
        {h2h.map((m, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between bg-slate-950/80 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-xs font-mono"
          >
            <span className="text-[10px] text-slate-500">{m.date}</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${m.winner === 'home' ? 'text-cyan-400' : 'text-slate-300'}`}>
                {homeTeam.substring(0, 8)}
              </span>
              <span className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded font-bold border border-slate-800">
                {m.homeScore} - {m.awayScore}
              </span>
              <span className={`font-semibold ${m.winner === 'away' ? 'text-rose-400' : 'text-slate-300'}`}>
                {awayTeam.substring(0, 8)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
