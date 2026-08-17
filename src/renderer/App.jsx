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
            <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden">
              {/* In-App Platform Bar */}
              <div className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Active In-App Frame:</span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">{currentUrl}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => handleNavigate('https://www.sportybet.com/ng/')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      currentUrl.includes('sportybet') 
                        ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    SportyBet
                  </button>
                  <button
                    onClick={() => handleNavigate('https://www.bet9ja.com/')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      currentUrl.includes('bet9ja') 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Bet9ja
                  </button>
                  <button
                    onClick={() => handleNavigate('https://1xbet.com/')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      currentUrl.includes('1xbet') 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    1xBet
                  </button>
                </div>
              </div>

              {/* In-App Web Viewport Frame */}
              <div className="flex-1 w-full h-full relative bg-slate-900 overflow-hidden flex flex-col">
                <iframe
                  src={currentUrl}
                  className="w-full h-full border-none bg-slate-900"
                  title="BetLens Platform Viewport"
                  allow="fullscreen; autoplay; clipboard-write; encrypted-media"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
                />

                {/* Quick Platform Access Hub Overlay (In-App) */}
                <div className="bg-slate-950 border-t border-slate-800 p-4 shrink-0 flex flex-wrap items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">BetLens Workspace Viewport</h4>
                      <p className="text-[11px] text-slate-400">Viewing active bookmaker inside BetLens workspace. Click fixture matches to view real-time Poisson analytics on the right panel.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigate('https://www.sportybet.com/ng/')}
                      className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <span>Load SportyBet In-App</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('https://www.bet9ja.com/')}
                      className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <span>Load Bet9ja In-App</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('https://1xbet.com/')}
                      className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <span>Load 1xBet In-App</span>
                    </button>
                  </div>
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
