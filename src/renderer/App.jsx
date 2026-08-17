import React, { useState, useEffect, useRef } from 'react';
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
      .then(data => {
        setAnalyticsData(data);
        setIsLoadingAnalytics(false);
      });

    return () => {
      if (typeof unsubscribeFixture === 'function') unsubscribeFixture();
      if (typeof unsubscribeBooking === 'function') unsubscribeBooking();
    };
  }, []);

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
        {/* Browser Viewport (Native Webview in Electron Desktop App, Live Analytics Hub in Web Browser) */}
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
            <div className="w-full h-full p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-slate-950/90 relative">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Live Platform Browser</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">Web Mode</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Access target sports betting sites below or use the AI Odds Generator to get instant 2, 3 & 5 odds codes.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOddsModalOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Get Free Bet Code</span>
                </button>
              </div>

              {/* Bookmaker Launch Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                {/* SportyBet */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 p-6 rounded-2xl flex flex-col justify-between transition-all group shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black px-3 py-1 rounded-lg">SportyBet</span>
                      <span className="text-[11px] text-slate-500 font-mono">NG / GH / KE</span>
                    </div>
                    <h4 className="font-extrabold text-base text-white mb-1 group-hover:text-red-400 transition-colors">SportyBet Nigeria</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Browse live matches, sports fixtures, and analyze statistical predictions in real time.</p>
                  </div>
                  <a
                    href="https://www.sportybet.com/ng/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 w-full bg-slate-800 hover:bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Open SportyBet</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Bet9ja */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl flex flex-col justify-between transition-all group shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black px-3 py-1 rounded-lg">Bet9ja</span>
                      <span className="text-[11px] text-slate-500 font-mono">Official Partner</span>
                    </div>
                    <h4 className="font-extrabold text-base text-white mb-1 group-hover:text-emerald-400 transition-colors">Bet9ja Nigeria</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Access Premier League, Champions League, and book odds tickets directly.</p>
                  </div>
                  <a
                    href="https://www.bet9ja.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 w-full bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Open Bet9ja</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                {/* 1xBet */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl flex flex-col justify-between transition-all group shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-black px-3 py-1 rounded-lg">1xBet</span>
                      <span className="text-[11px] text-slate-500 font-mono">Global Odds</span>
                    </div>
                    <h4 className="font-extrabold text-base text-white mb-1 group-hover:text-cyan-400 transition-colors">1xBet Platform</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Global markets, high odds boost selections, and automatic slip booking.</p>
                  </div>
                  <a
                    href="https://1xbet.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 w-full bg-slate-800 hover:bg-cyan-600 text-white font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Open 1xBet</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Desktop App Download Note */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Tip: Install the <strong>BetLens Desktop App</strong> to enable embedded webview side-by-side analytics scraping!</span>
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
