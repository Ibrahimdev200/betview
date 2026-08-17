const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('betlens', {
  webviewPreloadPath: 'file:///' + path.join(__dirname, 'webview-preload.js').replace(/\\/g, '/'),
  
  // Navigation & Shell IPC
  onFixtureDetected: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('fixture-detected', listener);
    return () => ipcRenderer.removeListener('fixture-detected', listener);
  },
  onBookingDetected: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('booking-detected', listener);
    return () => ipcRenderer.removeListener('booking-detected', listener);
  },
  
  // Analytics & Bets IPC
  fetchFixtureAnalytics: (homeTeam, awayTeam, league) => 
    ipcRenderer.invoke('analytics:fetch', { homeTeam, awayTeam, league }),
    
  getBookingHistory: () => 
    ipcRenderer.invoke('bets:getHistory'),
    
  copyToClipboard: (text) => 
    ipcRenderer.invoke('clipboard:copy', text),
    
  getSessionInfo: () => 
    ipcRenderer.invoke('session:getInfo'),

  // --- Auth & Supabase IPC ---
  login: (phone, password) =>
    ipcRenderer.invoke('auth:login', { phone, password }),

  register: (phone, password) =>
    ipcRenderer.invoke('auth:register', { phone, password }),

  getProfile: (userId) =>
    ipcRenderer.invoke('auth:getProfile', userId),

  // --- Automated Odds Generator IPC ---
  generateFreeOdds: (userId, platform, targetOdds) =>
    ipcRenderer.invoke('odds:generate', { userId, platform, targetOdds }),

  // --- Admin Dashboard & Notifications IPC ---
  adminGetUsers: () =>
    ipcRenderer.invoke('admin:getUsers'),

  adminSetUserPlan: (userId, plan) =>
    ipcRenderer.invoke('admin:setUserPlan', { userId, plan }),

  adminSendNotification: (targetUserId, title, message) =>
    ipcRenderer.invoke('admin:sendNotification', { targetUserId, title, message }),

  getNotifications: (userId) =>
    ipcRenderer.invoke('notifications:get', userId)
});
