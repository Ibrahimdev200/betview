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
import DailyFixturesDisplay from './components/DailyFixturesDisplay';
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

  const handleApplyRecommendation = (recommendation) => {
    if (!analyticsData) return;
    setAnalyticsData(prev => ({
      ...prev,
      selectedMarket: {
        marketName: recommendation.betterMarket,
        odds: recommendation.betterOdds,
        type: recommendation.betterMarket.includes('1X') ? 'dc1x' : recommendation.betterMarket.includes('X2') ? 'dcx2' : 'safe'
      }
    }));
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
        {/* API-Football Daily Games & Odds Dashboard Area */}
        <div className="flex-1 h-full relative bg-slate-900 overflow-hidden flex flex-col">
          <DailyFixturesDisplay
            onSelectBet={handleSelectFixtureAndMarket}
            onOpenOddsGenerator={() => setIsOddsModalOpen(true)}
          />
        </div>

        {/* Real-time Analytics Side Panel */}
        <AnalyticsPanel
          analytics={analyticsData}
          isLoading={isLoadingAnalytics}
          isOpen={isSidebarOpen}
          onApplyRecommendation={handleApplyRecommendation}
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
