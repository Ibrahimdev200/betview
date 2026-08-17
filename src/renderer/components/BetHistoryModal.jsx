import React, { useState } from 'react';
import { X, Copy, Check, Ticket, History, Trash2 } from 'lucide-react';

export default function BetHistoryModal({ isOpen, onClose, history, onCopyCode }) {
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (code, id) => {
    onCopyCode(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Booked Bets History (SQLite)</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Ticket className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-sm font-medium">No booking codes recorded yet.</p>
              <p className="text-xs text-slate-600">Book a bet on SportyBet or Bet9ja to auto-capture codes here.</p>
            </div>
          ) : (
            history.map((bet, idx) => (
              <div 
                key={bet.id || idx}
                className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white tracking-widest">{bet.code}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {bet.bookmaker}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Stake: <span className="text-emerald-400 font-semibold">₦{bet.stake}</span> • {new Date(bet.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(bet.code, bet.id || idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    copiedId === (bet.id || idx)
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copiedId === (bet.id || idx) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
