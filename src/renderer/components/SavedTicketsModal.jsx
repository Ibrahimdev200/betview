import React, { useState, useEffect } from 'react';
import { X, Trophy, TrendingUp, CheckCircle2, XCircle, Calendar, Bookmark, ShieldCheck, Trash2 } from 'lucide-react';
import ticketEngine from '../../services/ticket-generator-engine';

export default function SavedTicketsModal({ isOpen, onClose }) {
  const [perfData, setPerfData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const data = ticketEngine.getHistoricalPerformance();
      setPerfData(data);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tickets = perfData?.savedTickets || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-lg">
              📜
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-mono">
                SAVED TICKETS & HISTORICAL PERFORMANCE TRACK RECORD
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Transparent track record comparing BetLens AI predictions against completed results.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Historical Track Record Gauges (Requirement 23) */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-center">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase">Analyzed Picks</span>
            <span className="text-xl font-black text-slate-100">{perfData?.totalSelectionsAnalyzed}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase">Successful</span>
            <span className="text-xl font-black text-emerald-400">{perfData?.successfulSelections}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase">Hit Rate</span>
            <span className="text-xl font-black text-cyan-400">{perfData?.hitRate}%</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase">Avg Odds</span>
            <span className="text-xl font-black text-amber-400">@{perfData?.avgOdds}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated ROI</span>
            <span className="text-xl font-black text-emerald-400">+{perfData?.estimatedRoi}%</span>
          </div>
        </div>

        {/* Saved Tickets List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span>Saved AI Tickets ({tickets.length})</span>
          </h4>

          {tickets.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300 font-mono">No Saved Tickets Yet</h4>
              <p className="text-xs text-slate-500 font-mono">Generate a ticket in the AI Ticket Generator and click [Save Ticket].</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t, idx) => (
                <div key={t.ticketId || idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 font-mono">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold block">{t.date} • {t.ticketMode?.toUpperCase()} MODE</span>
                      <h4 className="font-extrabold text-sm text-white">BETLENS TICKET #{t.ticketId?.substr(4, 6)}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300">
                        Combined Odds: <strong className="text-cyan-400">@{t.combinedOdds}</strong>
                      </span>
                      <span className="text-xs text-slate-300">
                        Avg Score: <strong className="text-emerald-400">{t.avgScore}/100</strong>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {t.selections?.map((sel, si) => (
                      <div key={si} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">{si + 1}.</span>
                          <span className="text-white font-bold">{sel.homeTeam} vs {sel.awayTeam}</span>
                          <span className="text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80 text-[10px]">{sel.marketTitle}</span>
                        </div>
                        <span className="text-amber-400 font-bold">@{sel.odds}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
