import React, { useState } from 'react';
import { Ticket, Copy, Check, ExternalLink, Clock } from 'lucide-react';

export default function LastBookedBetWidget({ latestBet, onCopyCode }) {
  const [copied, setCopied] = useState(false);

  if (!latestBet) return null;

  const handleCopy = () => {
    onCopyCode(latestBet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between shadow-lg z-20">
      {/* Left Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse-subtle">
          <Ticket className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Last Booked Bet • {latestBet.bookmaker || 'SportyBet'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base text-white tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">
                {latestBet.code}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Stake: <strong className="text-emerald-400">₦{latestBet.stake}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{new Date(latestBet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md ${
            copied
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
