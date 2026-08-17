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
    // 1. Fetch booked bets history from SQLite DB
    if (window.betlens && window.betlens.getBookingHistory) {
      window.betlens.getBookingHistory().then(history => {
        if (history && history.length > 0) {
          setBookedBetsHistory(history);
          setLatestBet(history[0]);
        }
      });
    }

    // 2. Fetch Notifications
    loadNotifications(null);

    // 3. Listen for fixture click detection from webview
    let unsubscribeFixture = () => {};
    if (window.betlens && window.betlens.onFixtureDetected) {
      unsubscribeFixture = window.betlens.onFixtureDetected((analytics) => {
        console.log('[BetLens Renderer] Fixture analytics received:', analytics);
        setAnalyticsData(analytics);
        setIsLoadingAnalytics(false);
        setIsSidebarOpen(true);
      });
    }

    // 4. Listen for booking code detection from webview
    let unsubscribeBooking = () => {};
    if (window.betlens && window.betlens.onBookingDetected) {
      unsubscribeBooking = window.betlens.onBookingDetected((savedBet) => {
        console.log('[BetLens Renderer] Booking code detected:', savedBet);
        setLatestBet(savedBet);
        setBookedBetsHistory(prev => [savedBet, ...prev.filter(b => b.code !== savedBet.code)]);
        if (window.betlens.copyToClipboard) {
          window.betlens.copyToClipboard(savedBet.code);
        }
      });
    }

    // Initial demo analytics load
    if (window.betlens && window.betlens.fetchFixtureAnalytics) {
      setIsLoadingAnalytics(true);
      window.betlens.fetchFixtureAnalytics('Arsenal', 'Chelsea', 'Premier League')
        .then(data => {
          setAnalyticsData(data);
          setIsLoadingAnalytics(false);
        });
    }

    return () => {
      unsubscribeFixture();
      unsubscribeBooking();
    };
  }, []);

  const loadNotifications = (userId) => {
    if (window.betlens && window.betlens.getNotifications) {
      window.betlens.getNotifications(userId).then(notifs => {
        setNotifications(notifs || []);
      });
    }
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
        {/* Electron Webview Browser Viewport */}
        <div className="flex-1 h-full relative bg-slate-900">
          <webview
            ref={webviewRef}
            src={currentUrl}
            partition="persist:betlens_session"
            preload={window.betlens?.webviewPreloadPath || ''}
            className="w-full h-full border-none"
            allowpopups="true"
          />
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
