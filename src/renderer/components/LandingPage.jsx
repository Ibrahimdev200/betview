import React from 'react';
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  BarChart2, 
  Ticket, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  Check, 
  Flame, 
  Globe, 
  Crown, 
  Activity,
  Layers
} from 'lucide-react';
import heroImage from '../assets/hero-banner.jpg';
import logoImg from '../assets/logo.jpg';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden select-none">
      {/* 1. Header Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/25 shrink-0">
            <img src={logoImg} alt="BetLens Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wide leading-none">BetLens</h1>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Analytics Browser Pro</span>
          </div>
        </div>

        {/* Bookmaker Badges */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Supported Platforms:</span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-red-400 font-bold">SportyBet</span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-bold">Bet9ja</span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-cyan-400 font-bold">1xBet</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4 text-cyan-400" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-6 md:px-12 py-12 md:py-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs text-cyan-300 font-mono">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>AI Statistical Poisson Prediction Engine</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            The Desktop Browser Built for <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Smart Sports Betting</span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Browse SportyBet, Bet9ja, and 1xBet normally with persistent account login. Get real-time Poisson probabilities, head-to-head records, and automated <strong>2, 3, and 5 Odds</strong> booking codes.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Get 6 Free Bet Codes Monthly</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition-all"
            >
              Sign In to Launch Browser
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="block text-xl font-bold text-cyan-400">94.2%</span>
              <span className="text-slate-400 text-[11px]">Poisson Model Precision</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-emerald-400">2, 3, 5 Odds</span>
              <span className="text-slate-400 text-[11px]">Automated Slip Engine</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-amber-400">₦1,000 / mo</span>
              <span className="text-slate-400 text-[11px]">VIP Premium Access</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Graphic */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 group">
          <img
            src={heroImage}
            alt="BetLens Desktop Analytics Browser"
            className="w-full h-auto object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between font-mono">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> Live Match DOM Click Scraper Active
            </span>
            <span className="text-emerald-400 font-bold">100% Persistent Login Auth</span>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="bg-slate-900/60 border-y border-slate-800/80 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Simple 3-Step Workflow</span>
            <h3 className="text-2xl md:text-4xl font-black text-white">How BetLens Transforms Your Betting</h3>
            <p className="text-slate-400 text-xs md:text-sm">Engineered for seamless sports betting without interfering with bookmaker navigation or site login.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg font-mono">
                01
              </div>
              <h4 className="text-base font-bold text-white">Browse Any Sportsbook</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Open SportyBet, Bet9ja, or 1xBet. Log into your account once and stay logged in across restarts with persistent webview sessions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg font-mono">
                02
              </div>
              <h4 className="text-base font-bold text-white">Instant Poisson Analytics</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click on any match fixture. BetLens instantly computes goal expectations, Win/Draw/Away ratios, expected scorelines, and form badges.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg font-mono">
                03
              </div>
              <h4 className="text-base font-bold text-white">Auto-Book 2, 3, & 5 Odds</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click "Get Free Code" to generate high-probability 2, 3, or 5 odds tickets formatted for your selected platform with auto-copy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing / Membership Tiers */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Flexible Membership Plans</span>
          <h3 className="text-2xl md:text-4xl font-black text-white">Choose Your BetLens Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">Free Member</h4>
                <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-full border border-slate-700">Standard</span>
              </div>
              <div className="font-mono">
                <span className="text-3xl font-black text-white">₦0</span>
                <span className="text-slate-400 text-xs"> / forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>6 Free Bet Codes</strong> per month (2, 3 & 5 odds)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard Match Analysis & Odds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Persistent Login Session Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              Register Free Account
            </button>
          </div>

          {/* Premium VIP Card */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3 fill-slate-950" /> Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-extrabold text-amber-300">Premium VIP</h4>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/40">Full Access</span>
              </div>
              <div className="font-mono">
                <span className="text-3xl font-black text-amber-400">₦1,000</span>
                <span className="text-slate-400 text-xs"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>UNLIMITED Bet Codes</strong> (2, 3, and 5 odds)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Full High-Tier Poisson Goal Distribution AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Value Bet Edges & Expected Goals (xG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct Admin Notifications & Priority Updates</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Get Full Premium Access</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-6 md:px-12 text-center text-xs text-slate-500 space-y-2">
        <p className="font-mono">BetLens Analytics Browser • Copyright © 2026</p>
        <p className="text-[11px] text-slate-600">Built for SportyBet, Bet9ja, 1xBet, and LiveScore fixture analysis.</p>
      </footer>
    </div>
  );
}
