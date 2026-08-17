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
  
  // API Calls to Main Process
  fetchFixtureAnalytics: (homeTeam, awayTeam, league) => 
    ipcRenderer.invoke('analytics:fetch', { homeTeam, awayTeam, league }),
    
  getBookingHistory: () => 
    ipcRenderer.invoke('bets:getHistory'),
    
  copyToClipboard: (text) => 
    ipcRenderer.invoke('clipboard:copy', text),
    
  // Session & App Status
  getSessionInfo: () => 
    ipcRenderer.invoke('session:getInfo')
});
