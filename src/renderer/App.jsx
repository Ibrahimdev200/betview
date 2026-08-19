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
import DailyFixturesDisplay from './components/DailyFixturesDisplay';
import TicketGeneratorView from './components/TicketGeneratorView';
import SavedTicketsModal from './components/SavedTicketsModal';
import DailyBestFitsCard from './components/DailyBestFitsCard';
import betlensApi from './betlens-api';
import predictionEngine from '../services/prediction-engine';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('https://www.sportybet.com/ng/');
  const [activeView, setActiveView] = useState('generator'); // 'generator', 'matches', 'best_fits'
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('Loading fixture data...');
  const [analysisError, setAnalysisError] = useState(null);
  
  const [latestBet, setLatestBet] = useState(null);
  const [bookedBetsHistory, setBookedBetsHistory] = useState([]);

  // User & Auth State
  const [user, setUser] = useState(null);

  // Modals & Drawers State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSavedTicketsModalOpen, setIsSavedTicketsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [isOddsModalOpen, setIsOddsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeRequestIdRef = useRef(0);

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

    // 3. Listen for fixture click detection
    const unsubscribeFixture = betlensApi.onFixtureDetected((analytics) => {
      console.log('[BetLens Renderer] Fixture analytics received:', analytics);
      setAnalyticsData(analytics);
      if (analytics?.fixture?.id) {
        setSelectedMatchId(analytics.fixture.id);
      }
      setIsLoadingAnalytics(false);
      setIsSidebarOpen(true);
    });

    return () => {
      if (typeof unsubscribeFixture === 'function') unsubscribeFixture();
    };
  }, []);

  const handleSelectMatch = async (match, marketName, oddsVal, marketType) => {
    if (!match) return;

    const fixtureId = match.id || match.fixture?.id;
    setSelectedMatch(match);
    setSelectedMatchId(fixtureId);
    setIsLoadingAnalytics(true);
    setAnalysisError(null);
    setIsSidebarOpen(true);
    setAnalysisStep('Fixture information...');

    const requestId = ++activeRequestIdRef.current;

    const homeName = match.homeTeam?.name || match.homeTeam || 'Home';
    const chosenMarket = {
      marketName: marketName || `${homeName} Win (1)`,
      odds: oddsVal || match.odds?.home || 1.85,
      type: marketType || 'goals_over25'
    };

    try {
      const data = await betlensApi.fetchFixtureAnalytics(match, marketType || 'goals_over25', (stepText) => {
        if (activeRequestIdRef.current === requestId) {
          setAnalysisStep(stepText);
        }
      });

      if (activeRequestIdRef.current === requestId) {
        setAnalyticsData({
          ...data,
          selectedMarket: chosenMarket
        });
      }
    } catch (e) {
      if (activeRequestIdRef.current === requestId) {
        console.error('[App] Match analysis error:', e);
        setAnalysisError(e.message || 'Unable to analyze this match. Detailed statistics could not be retrieved.');
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsLoadingAnalytics(false);
      }
    }
  };

  const handleSelectMarketKey = (marketKey) => {
    if (!analyticsData) return;
    const marketAnalysis = predictionEngine.analyzeSpecificMarket(marketKey, analyticsData);
    setAnalyticsData(prev => ({
      ...prev,
      marketAnalysis,
      selectedMarket: {
        marketName: marketAnalysis.marketTitle,
        odds: marketAnalysis.marketOdds,
        type: marketKey
      }
    }));
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
    const defaultNotifs = [
      { id: '1', title: 'BetLens AI Engine Ready', message: 'API-Football data pipeline and Ticket Generator active.', timestamp: 'Just now', read: false },
      { id: '2', title: 'Top Statistical Fit Found', message: 'Arsenal vs Chelsea has 91/100 Over 1.5 Goal Score.', timestamp: '10m ago', read: false }
    ];
    setNotifications(defaultNotifs);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    loadNotifications(userData.id || userData.phone);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-100 select-none">
      {/* 1. Header / Navigation Chrome */}
      <BrowserChrome
        currentUrl={currentUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSavedTickets={() => setIsSavedTicketsModalOpen(true)}
        bookedBetsCount={bookedBetsHistory.length}
        user={user}
        onOpenAuth={() => handleOpenAuth('login')}
        onLogout={handleLogout}
        onOpenOddsGenerator={() => setIsOddsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        notificationsCount={notifications.length}
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        activeView={activeView}
        onSetView={setActiveView}
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
        
        {/* Main Content Area: Switches between AI Ticket Generator, Daily Matches, and Best Fits */}
        <div className="flex-1 h-full relative bg-slate-900 overflow-hidden flex flex-col">
          {activeView === 'generator' && (
            <TicketGeneratorView
              onSelectMatchForAnalysis={(match) => {
                handleSelectMatch(match);
              }}
            />
          )}

          {activeView === 'matches' && (
            <DailyFixturesDisplay
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              onOpenOddsGenerator={() => setIsOddsModalOpen(true)}
            />
          )}

          {activeView === 'best_fits' && (
            <div className="p-6 overflow-y-auto h-full">
              <DailyBestFitsCard
                onSelectMatch={(match) => {
                  handleSelectMatch(match);
                  setActiveView('matches');
                }}
              />
            </div>
          )}
        </div>

        {/* Real-time Analytics Side Panel */}
        <AnalyticsPanel
          analytics={analyticsData}
          isLoading={isLoadingAnalytics}
          loadingStep={analysisStep}
          error={analysisError}
          selectedMatchId={selectedMatchId}
          isOpen={isSidebarOpen}
          onSelectMarketKey={handleSelectMarketKey}
          onApplyRecommendation={handleApplyRecommendation}
          onRefresh={() => {
            if (selectedMatch) {
              handleSelectMatch(
                selectedMatch,
                analyticsData?.selectedMarket?.marketName,
                analyticsData?.selectedMarket?.odds,
                analyticsData?.selectedMarket?.type
              );
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

      <SavedTicketsModal
        isOpen={isSavedTicketsModalOpen}
        onClose={() => setIsSavedTicketsModalOpen(false)}
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
