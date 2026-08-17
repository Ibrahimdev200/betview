import React from 'react';
import { Trophy, Shield } from 'lucide-react';

export default function StandingsCard({ standings, homeTeam, awayTeam }) {
  if (!standings || !standings.home || !standings.away) return null;

  const { home, away } = standings;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">League Table Positions</h4>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Home Team Standings */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-400 text-[11px] truncate">{homeTeam}</span>
            <span className="bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded text-[10px] border border-cyan-500/30">
              #{home.rank}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1">
            <div className="flex justify-between"><span>Points:</span> <span className="font-bold text-white">{home.points}</span></div>
            <div className="flex justify-between"><span>Record:</span> <span>{home.won}W-{home.drawn}D-{home.lost}L</span></div>
            <div className="flex justify-between"><span>Goals:</span> <span>{home.gf}:{home.ga} ({home.gf - home.ga > 0 ? `+${home.gf - home.ga}` : home.gf - home.ga})</span></div>
          </div>
        </div>

        {/* Away Team Standings */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-400 text-[11px] truncate">{awayTeam}</span>
            <span className="bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded text-[10px] border border-rose-500/30">
              #{away.rank}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1">
            <div className="flex justify-between"><span>Points:</span> <span className="font-bold text-white">{away.points}</span></div>
            <div className="flex justify-between"><span>Record:</span> <span>{away.won}W-{away.drawn}D-{away.lost}L</span></div>
            <div className="flex justify-between"><span>Goals:</span> <span>{away.gf}:{away.ga} ({away.gf - away.ga > 0 ? `+${away.gf - away.ga}` : away.gf - away.ga})</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
