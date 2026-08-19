import React from 'react';
import { Swords } from 'lucide-react';

export default function H2HCard({ h2h, homeTeam, awayTeam }) {
  if (!h2h) return null;

  const matchesList = h2h.matches || (Array.isArray(h2h) ? h2h : []);
  const sampleSize = h2h.sampleSize ?? matchesList.length;

  if (sampleSize === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 select-none">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Head to Head History</h4>
        </div>
        <p className="text-xs text-slate-400 font-mono">No historical Head-to-Head matches recorded for this fixture.</p>
      </div>
    );
  }

  const homeWins = h2h.homeWins ?? matchesList.filter(m => m.winner === 'home').length;
  const awayWins = h2h.awayWins ?? matchesList.filter(m => m.winner === 'away').length;
  const draws = h2h.draws ?? matchesList.filter(m => m.winner === 'draw').length;

  const bttsCount = h2h.bttsCount ?? matchesList.filter(m => (m.homeScore > 0 && m.awayScore > 0)).length;
  const over25Count = h2h.over25Count ?? matchesList.filter(m => ((m.homeScore + m.awayScore) > 2.5)).length;

  const bttsPct = Math.round((bttsCount / sampleSize) * 100);
  const over25Pct = Math.round((over25Count / sampleSize) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 select-none">
      {/* Title & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Head to Head History</h4>
            <span className="text-[10px] text-slate-400 font-mono">Sample size: {sampleSize} match{sampleSize === 1 ? '' : 'es'}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-cyan-400 font-bold">{homeWins}W</span>
          <span>-</span>
          <span className="text-slate-300 font-bold">{draws}D</span>
          <span>-</span>
          <span className="text-rose-400 font-bold">{awayWins}W</span>
        </div>
      </div>

      {/* Metric Samples */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg text-center">
          <span className="text-[9px] text-slate-400 uppercase block">BTTS Trend</span>
          <span className="text-xs font-black text-emerald-400">{bttsCount}/{sampleSize} matches ({bttsPct}%)</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg text-center">
          <span className="text-[9px] text-slate-400 uppercase block">Over 2.5 Trend</span>
          <span className="text-xs font-black text-amber-400">{over25Count}/{sampleSize} matches ({over25Pct}%)</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-1.5 pt-1">
        {matchesList.slice(0, 5).map((m, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between bg-slate-950/80 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-xs font-mono"
          >
            <span className="text-[10px] text-slate-500">{m.date}</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-right ${m.winner === 'home' ? 'text-cyan-400' : 'text-slate-300'}`}>
                {(m.homeTeam || homeTeam).substring(0, 10)}
              </span>
              <span className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded font-bold border border-slate-800">
                {m.homeScore} - {m.awayScore}
              </span>
              <span className={`font-semibold ${m.winner === 'away' ? 'text-rose-400' : 'text-slate-300'}`}>
                {(m.awayTeam || awayTeam).substring(0, 10)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
