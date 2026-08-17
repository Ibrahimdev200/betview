import React, { useState, useEffect, useRef } from 'react';
import { Globe, Sparkles, ChevronRight, Activity } from 'lucide-react';
import BrowserChrome from './components/BrowserChrome';
import AnalyticsPanel from './components/AnalyticsPanel';
import LastBookedBetWidget from './components/LastBookedBetWidget';
import BetHistoryModal from './components/BetHistoryModal';
import AuthModal from './components/AuthModal';
import OddsGeneratorModal from './components/OddsGeneratorModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import NotificationDrawer from './components/NotificationDrawer';
import LandingPage from './components/LandingPage';
import betlensApi from './betlens-api';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('https://www.sportybet.com/ng/');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  const [latestBet, setLatestBet] = useState(null);
  const [bookedBetsHistory, setBookedBetsHistory] = useState([]);

  // User & Auth State
  const [user, setUser] = useState(null);

  // Modals & Drawers State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [isOddsModalOpen, setIsOddsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const webviewRef = useRef(null);

  // Initial load & IPC listeners
  useEffect(() => {
    // 1. Fetch booked bets history
    betlensApi.getBookingHistory().then(history => {
      if (history && history.length > 0) {
        setBookedBetsHistory(history);
        setLatestBet(history[0]);
      }
    });

    // 2. Fetch Notifications
    loadNotifications(null);

    // 3. Listen for fixture click detection from webview
    const unsubscribeFixture = betlensApi.onFixtureDetected((analytics) => {
      console.log('[BetLens Renderer] Fixture analytics received:', analytics);
      setAnalyticsData(analytics);
      setIsLoadingAnalytics(false);
      setIsSidebarOpen(true);
    });

    // 4. Listen for booking code detection from webview
    const unsubscribeBooking = betlensApi.onBookingDetected((savedBet) => {
      console.log('[BetLens Renderer] Booking code detected:', savedBet);
      setLatestBet(savedBet);
      setBookedBetsHistory(prev => [savedBet, ...prev.filter(b => b.code !== savedBet.code)]);
      betlensApi.copyToClipboard(savedBet.code);
    });

    // Initial demo analytics load
    setIsLoadingAnalytics(true);
    betlensApi.fetchFixtureAnalytics('Arsenal', 'Chelsea', 'Premier League')
      .then(analytics => {
        setAnalyticsData({
          ...analytics,
          selectedMarket: {
            marketName: 'Arsenal Win (1)',
            odds: 1.85,
            type: 'home'
          }
        });
        setIsLoadingAnalytics(false);
      });

    return () => {
      if (typeof unsubscribeFixture === 'function') unsubscribeFixture();
      if (typeof unsubscribeBooking === 'function') unsubscribeBooking();
    };
  }, []);

  const handleSelectFixtureAndMarket = async (fixture, marketName, oddsVal, marketType) => {
    setIsLoadingAnalytics(true);
    setIsSidebarOpen(true);
    try {
      const data = await betlensApi.fetchFixtureAnalytics(fixture.homeTeam, fixture.awayTeam, fixture.league);
      setAnalyticsData({
        ...data,
        selectedMarket: {
          marketName: marketName || `${fixture.homeTeam} Win (1)`,
          odds: oddsVal || fixture.odds.home,
          type: marketType || 'home'
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadNotifications = (userId) => {
    betlensApi.getNotifications(userId).then(notifs => {
      setNotifications(notifs || []);
    });
  };

  const handleLoginSuccess = (userProfile) => {
    setUser(userProfile);
    loadNotifications(userProfile.id);
  };

  const handleLogout = () => {
    setUser(null);
    loadNotifications(null);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Webview navigation helpers
  const handleNavigate = (url) => {
    setCurrentUrl(url);
    if (webviewRef.current) {
      webviewRef.current.loadURL(url);
    }
  };

  const handleGoBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) {
      webviewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const handleCopyCode = (code) => {
    if (window.betlens && window.betlens.copyToClipboard) {
      window.betlens.copyToClipboard(code);
    }
  };

  // Webview navigation listeners
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDidNavigate = (e) => {
      setCurrentUrl(e.url);
    };

    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate);

    return () => {
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
    };
  }, []);

  // If user is not logged in, render the Landing Page
  if (!user) {
    return (
      <>
        <LandingPage onOpenAuth={handleOpenAuth} />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authMode}
        />
      </>
    );
  }

  // Authenticated Dashboard & Desktop Browser Shell
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* 1. Top Navigation Chrome */}
      <BrowserChrome
        currentUrl={currentUrl}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        bookedBetsCount={bookedBetsHistory.length}
        user={user}
        onOpenAuth={() => handleOpenAuth('login')}
        onLogout={handleLogout}
        onOpenOddsGenerator={() => setIsOddsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        notificationsCount={notifications.length}
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
      />

      {/* 2. Last Booked Bet Banner */}
      {latestBet && (
        <LastBookedBetWidget
          latestBet={latestBet}
          onCopyCode={handleCopyCode}
        />
      )}

      {/* 3. Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      {/* 4. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Browser Viewport (Native Webview in Electron Desktop App, In-App Embedded Frame in Web Mode) */}
        <div className="flex-1 h-full relative bg-slate-900 overflow-hidden flex flex-col">
          {typeof window !== 'undefined' && (navigator.userAgent.toLowerCase().includes('electron') || window.process?.versions?.electron) ? (
            <webview
              ref={webviewRef}
              src={currentUrl}
              partition="persist:betlens_session"
              preload={window.betlens?.webviewPreloadPath || ''}
              className="w-full h-full border-none"
              allowpopups="true"
            />
          ) : (
            <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-y-auto p-4 md:p-6 space-y-6">
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Live Bookmaker Odds Selector</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">SportyBet • Bet9ja • 1xBet</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click ANY match or odds market below to analyze win probability & get AI smart recommendations instantly!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOddsModalOpen(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Generate Free Bet Code</span>
                  </button>
                </div>
              </div>

              {/* Live Matches & Odds Selection Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Live Fixtures & Odds Selection Matrix</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Click any odds button to run AI Poisson model</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'm1', homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'Premier League', matchTime: 'Today 20:00', odds: { home: 1.85, draw: 3.50, away: 4.20, over25: 1.90, btts: 1.75 } },
                    { id: 'm2', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', league: 'La Liga', matchTime: 'Today 21:00', odds: { home: 2.10, draw: 3.40, away: 3.20, over25: 1.70, btts: 1.60 } },
                    { id: 'm3', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', league: 'Bundesliga', matchTime: 'Tomorrow 17:30', odds: { home: 1.55, draw: 4.50, away: 5.00, over25: 1.45, btts: 1.50 } },
                    { id: 'm4', homeTeam: 'Inter Milan', awayTeam: 'Juventus', league: 'Serie A', matchTime: 'Tomorrow 19:45', odds: { home: 1.95, draw: 3.25, away: 3.80, over25: 2.05, btts: 1.85 } },
                    { id: 'm5', homeTeam: 'Enyimba FC', awayTeam: 'Kano Pillars', league: 'Nigeria NPFL', matchTime: 'Today 16:00', odds: { home: 1.70, draw: 3.10, away: 4.80, over25: 2.20, btts: 2.00 } }
                  ].map((fix) => (
                    <div 
                      key={fix.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                    >
                      {/* Match Information */}
                      <div className="space-y-1 cursor-pointer" onClick={() => handleSelectFixtureAndMarket(fix, `${fix.homeTeam} Win (1)`, fix.odds.home, 'home')}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
                            {fix.league}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{fix.matchTime}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                          <span>{fix.homeTeam}</span>
                          <span className="text-slate-500 font-normal text-xs">vs</span>
                          <span>{fix.awayTeam}</span>
                        </h4>
                      </div>

                      {/* Interactive Odds Selection Buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleSelectFixtureAndMarket(fix, `${fix.homeTeam} Win (1)`, fix.odds.home, 'home')}
                          className="flex-1 md:flex-none bg-slate-950 hover:bg-cyan-950 hover:border-cyan-500/60 border border-slate-800 px-3 py-2 rounded-lg text-center transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-mono block">1 (Home)</span>
                          <span className="text-xs font-bold text-cyan-400 font-mono">@{fix.odds.home}</span>
                        </button>

                        <button
                          onClick={() => handleSelectFixtureAndMarket(fix, 'Draw (X)', fix.odds.draw, 'draw')}
                          className="flex-1 md:flex-none bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-lg text-center transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-mono block">X (Draw)</span>
                          <span className="text-xs font-bold text-slate-200 font-mono">@{fix.odds.draw}</span>
                        </button>

                        <button
                          onClick={() => handleSelectFixtureAndMarket(fix, `${fix.awayTeam} Win (2)`, fix.odds.away, 'away')}
                          className="flex-1 md:flex-none bg-slate-950 hover:bg-rose-950 hover:border-rose-500/60 border border-slate-800 px-3 py-2 rounded-lg text-center transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-mono block">2 (Away)</span>
                          <span className="text-xs font-bold text-rose-400 font-mono">@{fix.odds.away}</span>
                        </button>

                        <button
                          onClick={() => handleSelectFixtureAndMarket(fix, 'Over 2.5 Goals', fix.odds.over25, 'over25')}
                          className="flex-1 md:flex-none bg-slate-950 hover:bg-amber-950 hover:border-amber-500/60 border border-slate-800 px-3 py-2 rounded-lg text-center transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-mono block">Over 2.5</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">@{fix.odds.over25}</span>
                        </button>

                        <button
                          onClick={() => handleSelectFixtureAndMarket(fix, 'Both Teams To Score', fix.odds.btts, 'btts')}
                          className="flex-1 md:flex-none bg-slate-950 hover:bg-emerald-950 hover:border-emerald-500/60 border border-slate-800 px-3 py-2 rounded-lg text-center transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-mono block">BTTS</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">@{fix.odds.btts}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Open Platform Links Bar */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Open Full Betting Platform Site in Window:</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href="https://www.sportybet.com/ng/" target="_blank" rel="noreferrer" className="bg-red-950 border border-red-800/60 text-red-300 font-bold px-3 py-1.5 rounded-lg hover:bg-red-900 transition-colors">
                    SportyBet Site ↗
                  </a>
                  <a href="https://www.bet9ja.com/" target="_blank" rel="noreferrer" className="bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-900 transition-colors">
                    Bet9ja Site ↗
                  </a>
                  <a href="https://1xbet.com/" target="_blank" rel="noreferrer" className="bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-900 transition-colors">
                    1xBet Site ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Analytics Side Panel */}
        <AnalyticsPanel
          analytics={analyticsData}
          isLoading={isLoadingAnalytics}
          isOpen={isSidebarOpen}
          onRefresh={() => {
            if (analyticsData?.fixture) {
              setIsLoadingAnalytics(true);
              window.betlens.fetchFixtureAnalytics(
                analyticsData.fixture.homeTeam,
                analyticsData.fixture.awayTeam,
                analyticsData.fixture.league
              ).then(data => {
                setAnalyticsData(data);
                setIsLoadingAnalytics(false);
              });
            }
          }}
        />
      </div>

      {/* 5. Modals */}
      <BetHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={bookedBetsHistory}
        onCopyCode={handleCopyCode}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authMode}
      />

      <OddsGeneratorModal
        isOpen={isOddsModalOpen}
        onClose={() => setIsOddsModalOpen(false)}
        user={user}
        onCodeGenerated={(ticket) => {
          setLatestBet({
            code: ticket.code,
            stake: '1,000.00',
            bookmaker: ticket.platform,
            timestamp: ticket.timestamp
          });
          setBookedBetsHistory(prev => [
            { code: ticket.code, stake: '1,000.00', bookmaker: ticket.platform, timestamp: ticket.timestamp },
            ...prev
          ]);
        }}
        onCopyCode={handleCopyCode}
        onOpenAuth={() => {
          setIsOddsModalOpen(false);
          handleOpenAuth('login');
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminUser={user}
      />
    </div>
  );
}
