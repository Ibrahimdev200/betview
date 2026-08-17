const { ipcRenderer } = require('electron');

console.log('[BetLens Preload] Webview Preload Script Injected successfully.');

let lastEmittedFixture = null;
let lastEmittedBookingCode = null;

// Helper to clean up team strings
function cleanTeamName(name) {
  if (!name) return '';
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(FC|CF|U21|U23|U19|Womens|Women|Reserves)\b/gi, '')
    .trim();
}

// 1. Fixture Extraction Logic
function tryExtractFixtureFromElement(target) {
  let container = target.closest(
    '.match-card, .m-table-row, .m-league-item, .event-row, .fixture-row, [class*="match"], [class*="fixture"], [class*="event"], tr, .m-coupon-row'
  ) || target.parentElement;

  if (!container) return null;

  let homeTeam = '';
  let awayTeam = '';
  let league = '';
  let odds = {};

  // Try specific SportyBet selectors
  const sportyHome = container.querySelector('.home-team, .m-team-name:first-child, .team-home, [class*="home-team"]');
  const sportyAway = container.querySelector('.away-team, .m-team-name:last-child, .team-away, [class*="away-team"]');
  const sportyLeague = container.closest('[class*="league"], [class*="segment"]')?.querySelector('.m-league-title, .league-name, .segment-title') || document.querySelector('.m-league-title, .league-name');

  if (sportyHome && sportyAway) {
    homeTeam = sportyHome.textContent.trim();
    awayTeam = sportyAway.textContent.trim();
  }

  // Try generic team pairs split by "vs", "v", "-", or separate team elements
  if (!homeTeam || !awayTeam) {
    const teamElements = container.querySelectorAll('.team-name, .team, .name, span, div');
    const nameTexts = [];
    teamElements.forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 2 && text.length < 35 && !text.match(/^[0-9.:\s]+$/) && !text.toLowerCase().includes('draw') && !nameTexts.includes(text)) {
        nameTexts.push(text);
      }
    });

    if (nameTexts.length >= 2) {
      homeTeam = nameTexts[0];
      awayTeam = nameTexts[1];
    }
  }

  // Check text content of container for "vs" pattern
  if (!homeTeam || !awayTeam) {
    const textContent = container.textContent || '';
    const vsMatch = textContent.match(/([A-Z0-9\s.]{3,25})\s+(?:vs|v|-)\s+([A-Z0-9\s.]{3,25})/i);
    if (vsMatch) {
      homeTeam = vsMatch[1].trim();
      awayTeam = vsMatch[2].trim();
    }
  }

  if (sportyLeague) {
    league = sportyLeague.textContent.trim();
  } else {
    // Try finding league title in DOM header
    const leagueEl = document.querySelector('.league-title, .m-league-title, h1, .category-name, [class*="league"]');
    if (leagueEl) league = leagueEl.textContent.trim();
  }

  // Extract odds if visible
  const oddsElements = container.querySelectorAll('.m-outcome-odds, .odds, .odd, .outcome-odds, [class*="odds"]');
  if (oddsElements.length >= 3) {
    odds = {
      home: parseFloat(oddsElements[0].textContent) || 1.85,
      draw: parseFloat(oddsElements[1].textContent) || 3.40,
      away: parseFloat(oddsElements[2].textContent) || 4.10
    };
  }

  if (homeTeam && awayTeam && homeTeam.toLowerCase() !== awayTeam.toLowerCase()) {
    return {
      homeTeam: cleanTeamName(homeTeam),
      awayTeam: cleanTeamName(awayTeam),
      rawHome: homeTeam,
      rawAway: awayTeam,
      league: league || 'Premier League',
      odds: odds.home ? odds : { home: 2.10, draw: 3.30, away: 3.50 },
      kickoffTime: new Date().toISOString(),
      timestamp: Date.now()
    };
  }

  return null;
}

// Global click handler to capture clicked fixtures
document.addEventListener('click', (event) => {
  const fixture = tryExtractFixtureFromElement(event.target);
  if (fixture) {
    const fixtureKey = `${fixture.homeTeam}_vs_${fixture.awayTeam}`;
    if (!lastEmittedFixture || lastEmittedFixture !== fixtureKey) {
      lastEmittedFixture = fixtureKey;
      console.log('[BetLens Preload] Fixture detected:', fixture);
      ipcRenderer.sendToHost('fixture-detected', fixture);
    }
  }
}, true);


// 2. Bet Booking Code Watcher (MutationObserver)
function scanForBookingCode() {
  // Common booking code selectors across SportyBet, Bet9ja, etc.
  const selectors = [
    '.m-booking-code',
    '.booking-code',
    '.coupon-code',
    '.bookingCode',
    '.booking-number',
    '.share-code',
    '[data-booking-code]',
    '.booking_code'
  ];

  let codeText = '';
  let codeElement = null;

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      codeElement = el;
      codeText = el.textContent.trim();
      break;
    }
  }

  // Fallback: search DOM for elements containing text like "Booking Code: BC1234"
  if (!codeText) {
    const allSpans = document.querySelectorAll('span, div, p, strong, b');
    for (const el of allSpans) {
      const text = el.textContent.trim();
      const match = text.match(/(?:booking code|booking ref|share code|coupon code)[:\s]+([A-Z0-9]{4,10})/i);
      if (match) {
        codeText = match[1];
        break;
      }
    }
  }

  if (codeText && codeText.length >= 4 && codeText.length <= 15) {
    // Sanitize code string
    const cleanCode = codeText.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanCode && lastEmittedBookingCode !== cleanCode) {
      lastEmittedBookingCode = cleanCode;
      
      // Try to extract stake & selections
      let stake = '1,000.00';
      const stakeEl = document.querySelector('.stake-amount, .total-stake, [class*="stake"], .m-stake');
      if (stakeEl) stake = stakeEl.textContent.trim();

      const bookingPayload = {
        code: cleanCode,
        stake: stake || '1,000.00',
        bookmaker: window.location.hostname.includes('sportybet') ? 'SportyBet' : 
                   window.location.hostname.includes('bet9ja') ? 'Bet9ja' : 'Sportsbook',
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      console.log('[BetLens Preload] Booking code detected:', bookingPayload);
      ipcRenderer.sendToHost('booking-detected', bookingPayload);
    }
  }
}

// Observe DOM mutations to catch popup modals containing booking codes
const observer = new MutationObserver(() => {
  scanForBookingCode();
});

document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  scanForBookingCode();
});
