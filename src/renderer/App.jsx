import React, { useState, useEffect, useRef } from 'react';
import BrowserChrome from './components/BrowserChrome';
import AnalyticsPanel from './components/AnalyticsPanel';
import LastBookedBetWidget from './components/LastBookedBetWidget';
import BetHistoryModal from './components/BetHistoryModal';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('https://www.sportybet.com/ng/');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  const [latestBet, setLatestBet] = useState(null);
  const [bookedBetsHistory, setBookedBetsHistory] = useState([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const webviewRef = useRef(null);

  // Initial setup & IPC listeners
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

    // 2. Listen for fixture click detection from webview
    let unsubscribeFixture = () => {};
    if (window.betlens && window.betlens.onFixtureDetected) {
      unsubscribeFixture = window.betlens.onFixtureDetected((analytics) => {
        console.log('[BetLens Renderer] Fixture analytics received:', analytics);
        setAnalyticsData(analytics);
        setIsLoadingAnalytics(false);
        setIsSidebarOpen(true);
      });
    }

    // 3. Listen for booking code detection from webview
    let unsubscribeBooking = () => {};
    if (window.betlens && window.betlens.onBookingDetected) {
      unsubscribeBooking = window.betlens.onBookingDetected((savedBet) => {
        console.log('[BetLens Renderer] Booking code detected:', savedBet);
        setLatestBet(savedBet);
        setBookedBetsHistory(prev => [savedBet, ...prev.filter(b => b.code !== savedBet.code)]);
        
        // Auto-copy to clipboard
        if (window.betlens.copyToClipboard) {
          window.betlens.copyToClipboard(savedBet.code);
        }
      });
    }

    // Demo Initial Fixture Analytics for demo
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

  // Webview lifecycle listeners
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

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Browser Navigation Chrome */}
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
      />

      {/* 2. Last Booked Bet Banner Widget */}
      {latestBet && (
        <LastBookedBetWidget
          latestBet={latestBet}
          onCopyCode={handleCopyCode}
        />
      )}

      {/* 3. Main Workspace Layout */}
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

      {/* 4. Booked Bets History Modal */}
      <BetHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={bookedBetsHistory}
        onCopyCode={handleCopyCode}
      />
    </div>
  );
}
