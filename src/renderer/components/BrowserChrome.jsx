import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  Globe, 
  PanelRightOpen, 
  PanelRightClose, 
  History, 
  Sparkles,
  Zap,
  User,
  Crown,
  Bell,
  Shield,
  LogOut,
  LogIn
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function BrowserChrome({ 
  currentUrl, 
  onNavigate, 
  onGoBack, 
  onGoForward, 
  onReload, 
  isSidebarOpen, 
  onToggleSidebar,
  onOpenHistory,
  bookedBetsCount,
  user,
  onOpenAuth,
  onLogout,
  onOpenOddsGenerator,
  onOpenAdmin,
  notificationsCount,
  onToggleNotifications
}) {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    onNavigate(target);
  };

  const presets = [
    { name: 'SportyBet', url: 'https://www.sportybet.com/ng/' },
    { name: 'Bet9ja', url: 'https://www.bet9ja.com/' },
    { name: '1xBet', url: 'https://1xbet.com/' }
  ];

  const isPremium = user?.plan === 'premium';
  const isAdmin = user?.role === 'admin' || user?.phone === '09033675852';

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800/80 px-3 flex items-center justify-between gap-2 shadow-md z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 shrink-0">
          <img src={logoImg} alt="BetLens Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-white tracking-wider leading-none">BetLens</span>
          <span className="text-[10px] text-cyan-400 font-medium tracking-tight">Desktop Analytics</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onGoBack} title="Back" className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={onGoForward} title="Forward" className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onReload} title="Reload Page" className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* API-Football Connected Status Bar */}
      <div className="flex-1 max-w-xl flex items-center">
        <div className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold">API-Football v3 Live Engine</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60 hidden sm:inline">
              v3.football.api-sports.io
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold">Key Connected</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: "Get Free Code", Admin Button, Auth, Notifications */}
      <div className="flex items-center gap-2 pl-2 border-l border-slate-800 shrink-0">
        {/* Get Free Code Button */}
        <button
          onClick={onOpenOddsGenerator}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Get Free Code</span>
        </button>

        {/* Admin Dashboard Button (If Admin) */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1"
            title="Master Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Bet Log History Button */}
        <button
          onClick={onOpenHistory}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors relative"
          title="Booked Bet History"
        >
          <History className="w-4 h-4 text-cyan-400" />
        </button>

        {/* User Account / Login Badge */}
        {user ? (
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-xs font-mono">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-bold hidden xl:inline">{user.phone}</span>
            {isPremium ? (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> VIP
              </span>
            ) : (
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded">
                FREE
              </span>
            )}
            <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-rose-400 ml-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Analytics Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg transition-all border ${
            isSidebarOpen ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}
          title="Toggle Analytics Panel"
        >
          {isSidebarOpen ? <PanelRightClose className="w-4 h-4 text-cyan-400" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
