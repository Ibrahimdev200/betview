const { app, BrowserWindow, ipcMain, clipboard, session } = require('electron');
const path = require('path');
const db = require('./db');
const dataPipeline = require('../services/data-pipeline');
const oddsGenerator = require('../services/odds-generator');
const supabaseService = require('../services/supabase-service');

let mainWindow = null;

function createWindow() {
  const betlensSession = session.fromPartition('persist:betlens_session');
  betlensSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'BetLens Analytics Browser',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/app-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const prodHtml = path.join(__dirname, '../../dist/index.html');

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      setTimeout(() => mainWindow.loadURL(devServerUrl), 1000);
    });
  } else {
    mainWindow.loadFile(prodHtml);
  }

  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    console.log('[BetLens Main] Webview attached successfully.');

    webContents.on('ipc-message', async (e, channel, ...args) => {
      if (channel === 'fixture-detected') {
        const fixtureData = args[0];
        const analytics = await dataPipeline.getFixtureAnalytics(
          fixtureData.homeTeam,
          fixtureData.awayTeam,
          fixtureData.league,
          fixtureData.odds
        );
        mainWindow.webContents.send('fixture-detected', analytics);
      } 
      else if (channel === 'booking-detected') {
        const bookingData = args[0];
        const savedBet = db.addBookedBet(bookingData);
        mainWindow.webContents.send('booking-detected', savedBet);
      }
    });
  });
}

// App Initialization
app.whenReady().then(() => {
  db.init();

  // Standard IPC Handlers
  ipcMain.handle('analytics:fetch', async (event, { homeTeam, awayTeam, league }) => {
    return await dataPipeline.getFixtureAnalytics(homeTeam, awayTeam, league);
  });

  ipcMain.handle('bets:getHistory', () => {
    return db.getBookedBets();
  });

  ipcMain.handle('clipboard:copy', (event, text) => {
    if (text) {
      clipboard.writeText(text);
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('session:getInfo', () => {
    return {
      partition: 'persist:betlens_session',
      persistent: true,
      userStorage: app.getPath('userData')
    };
  });

  // --- Auth & Supabase IPC Handlers ---
  ipcMain.handle('auth:login', async (event, { phone, password }) => {
    return await supabaseService.login(phone, password);
  });

  ipcMain.handle('auth:register', async (event, { phone, password }) => {
    return await supabaseService.register(phone, password);
  });

  ipcMain.handle('auth:getProfile', (event, userId) => {
    return db.getUserProfile(userId);
  });

  // --- Odds Generator IPC ---
  ipcMain.handle('odds:generate', (event, { userId, platform, targetOdds }) => {
    return oddsGenerator.generateOdds(userId, platform, targetOdds);
  });

  // --- Admin Dashboard IPC ---
  ipcMain.handle('admin:getUsers', async () => {
    return await supabaseService.getAllUsers();
  });

  ipcMain.handle('admin:setUserPlan', async (event, { userId, plan }) => {
    return await supabaseService.setUserPlan(userId, plan);
  });

  ipcMain.handle('admin:sendNotification', async (event, { targetUserId, title, message }) => {
    return await supabaseService.sendNotification(targetUserId, title, message);
  });

  ipcMain.handle('notifications:get', async (event, userId) => {
    return await supabaseService.getNotifications(userId);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
