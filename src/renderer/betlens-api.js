import apiFootballService from './api-football-service';
import predictionEngine from '../services/prediction-engine';

const LOCAL_USERS_KEY = 'betlens_web_users_db';
const LOCAL_NOTIFS_KEY = 'betlens_web_notifications_db';

// Capture native Electron IPC object if injected by app-preload.js
const nativeBetlens = (typeof window !== 'undefined' && window.betlens && window.betlens.login && window.betlens !== undefined) ? window.betlens : null;

function getWebUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Default Seed Admin User
  return [
    {
      id: 'admin-uuid-001',
      phone: '09033675852',
      password: '@Dherinosha1',
      role: 'admin',
      plan: 'premium',
      codeGenerationsCount: 0,
      createdAt: new Date().toISOString()
    }
  ];
}

function saveWebUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

function getWebNotifications() {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'notif-welcome-001',
      user_id: null,
      title: 'Welcome to BetLens Pro!',
      message: 'Get free 2, 3, and 5 odds booking codes daily on SportyBet, Bet9ja, and 1xBet!',
      read: false,
      created_at: new Date().toISOString()
    }
  ];
}

function saveWebNotifications(notifs) {
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(notifs));
  } catch (e) {}
}

// Global Polyfill Object
const betlensApi = {
  // Navigation & Shell IPC
  onFixtureDetected: (callback) => {
    if (nativeBetlens && nativeBetlens.onFixtureDetected) {
      return nativeBetlens.onFixtureDetected(callback);
    }
    return () => {};
  },

  onBookingDetected: (callback) => {
    if (nativeBetlens && nativeBetlens.onBookingDetected) {
      return nativeBetlens.onBookingDetected(callback);
    }
    return () => {};
  },

  fetchFixtureAnalytics: async (matchArg, awayTeam, league, onProgress) => {
    try {
      let matchObj = matchArg;
      if (typeof matchArg === 'string') {
        matchObj = {
          id: `custom-${matchArg}-${awayTeam}`,
          homeTeam: { id: 101, name: matchArg },
          awayTeam: { id: 102, name: awayTeam },
          league: { id: 39, name: league || 'Premier League' },
          date: new Date().toISOString(),
          odds: { home: 1.85, draw: 3.40, away: 2.90, over25: 1.75, btts: 1.65, dc1x: 1.22 }
        };
      }

      // Execute full data pipeline
      const statsPayload = await apiFootballService.getCompleteMatchAnalysisData(matchObj, onProgress);
      
      // Calculate predictions
      const prediction = predictionEngine.predict(
        statsPayload.fixture.homeTeam,
        statsPayload.fixture.awayTeam,
        statsPayload.h2h,
        statsPayload.homeForm,
        statsPayload.awayForm,
        statsPayload.odds,
        statsPayload.homeSplit,
        statsPayload.awaySplit,
        statsPayload.squadNews
      );

      return {
        ...statsPayload,
        prediction
      };
    } catch (e) {
      console.error('[BetLens API] Fetch analytics error:', e);
      throw e;
    }
  },

  getBookingHistory: async () => {
    if (nativeBetlens && nativeBetlens.getBookingHistory) {
      try {
        return await nativeBetlens.getBookingHistory();
      } catch (e) {}
    }
    return [];
  },

  copyToClipboard: async (text) => {
    if (nativeBetlens && nativeBetlens.copyToClipboard) {
      try {
        return await nativeBetlens.copyToClipboard(text);
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },

  // --- Auth Login & Register ---
  login: async (phone, password) => {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    // 1. Try Desktop Electron IPC if available
    if (nativeBetlens && nativeBetlens.login) {
      try {
        const res = await nativeBetlens.login(cleanPhone, cleanPass);
        if (res && res.success) return res;
      } catch (e) {
        console.warn('[BetLens API] Electron login IPC failed, using Web Fallback:', e);
      }
    }

    // 2. Web / Fallback Auth Logic
    const users = getWebUsers();
    const existing = users.find(u => u.phone === cleanPhone);

    if (!existing) {
      return {
        success: false,
        error: 'Phone number not registered. Please click Register to create an account.'
      };
    }

    if (existing.password !== cleanPass && existing.password_hash !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.'
      };
    }

    const isMasterAdmin = cleanPhone === '09033675852';

    return {
      success: true,
      user: {
        id: existing.id,
        phone: existing.phone,
        role: isMasterAdmin ? 'admin' : (existing.role || 'user'),
        plan: isMasterAdmin ? 'premium' : (existing.plan || 'free'),
        codeGenerationsCount: existing.codeGenerationsCount || 0,
        createdAt: existing.createdAt || new Date().toISOString()
      }
    };
  },

  register: async (phone, password) => {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    // 1. Try Desktop Electron IPC if available
    if (nativeBetlens && nativeBetlens.register) {
      try {
        const res = await nativeBetlens.register(cleanPhone, cleanPass);
        if (res && res.success) return res;
      } catch (e) {
        console.warn('[BetLens API] Electron register IPC failed, using Web Fallback:', e);
      }
    }

    // 2. Web / Fallback Auth Logic
    const users = getWebUsers();
    if (users.some(u => u.phone === cleanPhone)) {
      return {
        success: false,
        error: 'Phone number is already registered. Please sign in instead.'
      };
    }

    const isMasterAdmin = cleanPhone === '09033675852';
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      phone: cleanPhone,
      password: cleanPass,
      role: isMasterAdmin ? 'admin' : 'user',
      plan: isMasterAdmin ? 'premium' : 'free',
      codeGenerationsCount: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveWebUsers(users);

    return {
      success: true,
      user: {
        id: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        plan: newUser.plan,
        codeGenerationsCount: 0,
        createdAt: newUser.createdAt
      }
    };
  },

  getProfile: async (userId) => {
    if (nativeBetlens && nativeBetlens.getProfile) {
      try {
        return await nativeBetlens.getProfile(userId);
      } catch (e) {}
    }
    const users = getWebUsers();
    return users.find(u => u.id === userId) || null;
  },

  // --- Automated Odds Generator ---
  generateFreeOdds: async (userId, platform, targetOdds) => {
    if (nativeBetlens && nativeBetlens.generateFreeOdds) {
      try {
        return await nativeBetlens.generateFreeOdds(userId, platform, targetOdds);
      } catch (e) {}
    }

    // Web Fallback Odds Generator
    const randomCode = (platform === '1xBet' ? '1X' : platform === 'Bet9ja' ? 'B9' : 'SB') + 
      Math.random().toString(36).substring(2, 7).toUpperCase();

    return {
      success: true,
      ticket: {
        code: randomCode,
        platform: platform || 'SportyBet',
        targetOdds: targetOdds || 2,
        actualOdds: (targetOdds * (0.95 + Math.random() * 0.1)).toFixed(2),
        selections: [
          { match: 'Arsenal vs Chelsea', market: 'Over 1.5 Goals', odds: 1.32 },
          { match: 'Real Madrid vs Sevilla', market: 'Home Win', odds: 1.45 },
          { match: 'Bayern Munich vs Leipzig', market: 'Both Teams To Score', odds: 1.55 }
        ].slice(0, targetOdds === 5 ? 3 : 2),
        created_at: new Date().toISOString()
      }
    };
  },

  // --- Admin Dashboard IPC ---
  adminGetUsers: async () => {
    if (nativeBetlens && nativeBetlens.adminGetUsers) {
      try {
        return await nativeBetlens.adminGetUsers();
      } catch (e) {}
    }
    return getWebUsers();
  },

  adminSetUserPlan: async (userId, plan) => {
    if (nativeBetlens && nativeBetlens.adminSetUserPlan) {
      try {
        return await nativeBetlens.adminSetUserPlan(userId, plan);
      } catch (e) {}
    }
    const users = getWebUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].plan = plan;
      saveWebUsers(users);
    }
    return { success: true };
  },

  adminSendNotification: async (targetUserId, title, message) => {
    if (nativeBetlens && nativeBetlens.adminSendNotification) {
      try {
        return await nativeBetlens.adminSendNotification(targetUserId, title, message);
      } catch (e) {}
    }
    const notifs = getWebNotifications();
    notifs.unshift({
      id: 'notif_' + Date.now(),
      user_id: targetUserId,
      title,
      message,
      read: false,
      created_at: new Date().toISOString()
    });
    saveWebNotifications(notifs);
    return { success: true };
  },

  getNotifications: async (userId) => {
    if (nativeBetlens && nativeBetlens.getNotifications) {
      try {
        return await nativeBetlens.getNotifications(userId);
      } catch (e) {}
    }
    const notifs = getWebNotifications();
    return notifs.filter(n => !n.user_id || n.user_id === userId);
  }
};

// Ensure window.betlens is safely initialized
if (typeof window !== 'undefined') {
  window.betlens = betlensApi;
}

export default betlensApi;
