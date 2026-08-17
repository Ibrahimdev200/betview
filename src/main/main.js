const { app, BrowserWindow, ipcMain, clipboard, session } = require('electron');
const path = require('path');
const db = require('./db');
const dataPipeline = require('../services/data-pipeline');

let mainWindow = null;

function createWindow() {
  // Ensure persistent session partition exists
  const betlensSession = session.fromPartition('persist:betlens_session');
  betlensSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true); // Allow normal web permissions on target betting sites
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
      webSecurity: false // Allows webview cross-origin framing smoothly
    }
  });

  // Load Vite Dev Server URL or Production Build HTML file
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const prodHtml = path.join(__dirname, '../../dist/index.html');

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback if dev server is starting up
      setTimeout(() => mainWindow.loadURL(devServerUrl), 1000);
    });
  } else {
    mainWindow.loadFile(prodHtml);
  }

  // Handle webview IPC messages relayed via webContents
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    console.log('[BetLens Main] Webview attached successfully.');

    // Inject webview preload script
    webContents.on('ipc-message', async (e, channel, ...args) => {
      console.log(`[BetLens Main] Received webview IPC [${channel}]:`, args[0]);

      if (channel === 'fixture-detected') {
        const fixtureData = args[0];
        // Fetch analytics automatically for detected fixture
        const analytics = await dataPipeline.getFixtureAnalytics(
          fixtureData.homeTeam,
          fixtureData.awayTeam,
          fixtureData.league,
          fixtureData.odds
        );
        // Relay to renderer
        mainWindow.webContents.send('fixture-detected', analytics);
      } 
      else if (channel === 'booking-detected') {
        const bookingData = args[0];
        // Save to SQLite database
        const savedBet = db.addBookedBet(bookingData);
        // Relay to renderer for Last Booked Bet widget update
        mainWindow.webContents.send('booking-detected', savedBet);
      }
    });
  });
}

// App Initialization
app.whenReady().then(() => {
  db.init();

  // Register IPC Handlers
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
