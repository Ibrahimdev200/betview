import React, { useState } from 'react';
import { Sparkles, Ticket, Copy, Check, ShieldAlert, Award, X, Zap, ChevronRight, Crown } from 'lucide-react';

export default function OddsGeneratorModal({ isOpen, onClose, user, onCodeGenerated, onCopyCode, onOpenAuth }) {
  const [platform, setPlatform] = useState('SportyBet');
  const [targetOdds, setTargetOdds] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPremium = user?.plan === 'premium';
  const usedCount = user?.codeGenerationsCount || 0;
  const maxFree = 6;
  const freeRemaining = Math.max(0, maxFree - usedCount);

  const handleGenerate = async () => {
    setError('');
    setGeneratedTicket(null);

    if (!user) {
      setError('Please sign in or register an account to generate free bet codes.');
      return;
    }

    setLoading(true);

    try {
      const res = await window.betlens.generateFreeOdds(user.id, platform, targetOdds);
      if (res.success) {
        setGeneratedTicket(res.ticket);
        if (onCodeGenerated) onCodeGenerated(res.ticket);
      } else {
        setError(res.error || 'Failed to generate booking code.');
      }
    } catch (err) {
      setError('Error generating booking code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    onCopyCode(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Daily Odds Code Generator</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  AI Selection
                </span>
              </h3>
              <p className="text-xs text-slate-400">Automated 2, 3, and 5 Odds Booking Slip Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quota Banner */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Account:</span>
              <span className="font-bold text-white">{user.phone}</span>
              {isPremium ? (
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-slate-950" /> PREMIUM (Unlimited)
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                  FREE ({freeRemaining} of 6 left)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-amber-400 text-xs font-semibold">Sign in required to generate codes</span>
              <button
                onClick={onOpenAuth}
                className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="bg-rose-950/70 border border-rose-500/50 text-rose-300 p-3.5 rounded-xl text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              {!isPremium && user && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-amber-500/30 mt-1 flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-bold block text-xs">Upgrade to Premium for ₦1,000/mo</span>
                    <span className="text-[10px] text-slate-400">Unlock unlimited 2, 3, and 5 odds codes & full analysis</span>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-1 rounded font-bold">Contact Admin</span>
                </div>
              )}
            </div>
          )}

          {/* 1. Platform Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Choose Bookmaker Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['SportyBet', 'Bet9ja', '1xBet'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    platform === p
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{p}</span>
                  <span className="text-[9px] text-slate-500 font-mono font-normal">Auto Booking</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target Odds Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Select Target Odds Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { odds: 2, label: '2.00+ Odds', desc: '2 Safe Selections' },
                { odds: 3, label: '3.00+ Odds', desc: '3 Solid Selections' },
                { odds: 5, label: '5.00+ Odds', desc: '4 High Value Picks' }
              ].map((item) => (
                <button
                  key={item.odds}
                  onClick={() => setTargetOdds(item.odds)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    targetOdds === item.odds
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-sm font-extrabold text-white">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal mt-0.5 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Generate {targetOdds} Odds Booking Code</span>
              </>
            )}
          </button>

          {/* Generated Code Result Card */}
          {generatedTicket && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 shadow-xl animate-pulse-subtle">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase">{generatedTicket.platform} Ticket</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Total Odds: @{generatedTicket.actualOdds}
                </span>
              </div>

              {/* Code Banner */}
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Booking Code</span>
                  <span className="font-mono font-black text-xl text-white tracking-widest">{generatedTicket.code}</span>
                </div>

                <button
                  onClick={() => handleCopy(generatedTicket.code)}
                  className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Selections List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched Poisson AI Selections</span>
                {generatedTicket.selections.map((sel, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-slate-200 font-bold block">{sel.home} vs {sel.away}</span>
                      <span className="text-[10px] text-cyan-400">{sel.market}</span>
                    </div>
                    <span className="font-bold text-emerald-400">@{sel.odds}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
