const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class BetLensDB {
  constructor() {
    this.dbPath = null;
    this.fixturesCache = new Map();
    this.bookedBets = [];
    this.users = [];
    this.notifications = [];
    this.generatedCodes = [];
    this.activeUser = null;
  }

  init() {
    try {
      const userDataDir = app ? app.getPath('userData') : process.cwd();
      this.dbPath = path.join(userDataDir, 'betlens_db.json');

      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.fixtures) {
          Object.entries(data.fixtures).forEach(([k, v]) => this.fixturesCache.set(k, v));
        }
        if (Array.isArray(data.bookedBets)) this.bookedBets = data.bookedBets;
        if (Array.isArray(data.users)) this.users = data.users;
        if (Array.isArray(data.notifications)) this.notifications = data.notifications;
        if (Array.isArray(data.generatedCodes)) this.generatedCodes = data.generatedCodes;
      }

      // Ensure Admin Account Exists (Phone: 09033675852 / Password: @Dherinosha1)
      let admin = this.users.find(u => u.phone === '09033675852');
      if (!admin) {
        admin = {
          id: 'usr_admin_master',
          phone: '09033675852',
          password: '@Dherinosha1',
          role: 'admin',
          plan: 'premium',
          expiresAt: '2099-12-31T23:59:59.000Z',
          codeGenerationsCount: 0,
          createdAt: new Date().toISOString()
        };
        this.users.unshift(admin);
        this.save();
      }

      // Seed initial welcome notification for broadcast
      if (this.notifications.length === 0) {
        this.notifications.push({
          id: 'notif_welcome',
          userId: null, // broadcast to all
          title: 'Welcome to BetLens Pro!',
          message: 'Get free 2, 3, and 5 odds codes daily on SportyBet, Bet9ja, and 1xBet. Upgrade to Premium for ₦1,000/mo for unlimited access!',
          read: false,
          createdAt: new Date().toISOString()
        });
        this.save();
      }

      console.log('[BetLens DB] Storage initialized with', this.users.length, 'users.');
    } catch (err) {
      console.error('[BetLens DB] Error initializing storage:', err);
    }
  }

  save() {
    try {
      if (!this.dbPath) return;
      const data = {
        fixtures: Object.fromEntries(this.fixturesCache),
        bookedBets: this.bookedBets,
        users: this.users,
        notifications: this.notifications,
        generatedCodes: this.generatedCodes,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[BetLens DB] Error saving data:', err);
    }
  }

  // --- Auth & User Management ---
  registerUser(phone, password) {
    const cleanPhone = phone.trim();
    const existing = this.users.find(u => u.phone === cleanPhone);
    if (existing) {
      return { success: false, error: 'Phone number already registered. Please login.' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      phone: cleanPhone,
      password: password.trim(),
      role: cleanPhone === '09033675852' ? 'admin' : 'user',
      plan: cleanPhone === '09033675852' ? 'premium' : 'free',
      expiresAt: cleanPhone === '09033675852' ? '2099-12-31T23:59:59.000Z' : null,
      codeGenerationsCount: 0,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.save();
    return { success: true, user: this.sanitizeUser(newUser) };
  }

  loginUser(phone, password) {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    const user = this.users.find(u => u.phone === cleanPhone && u.password === cleanPass);
    if (!user) {
      return { success: false, error: 'Invalid phone number or password.' };
    }

    this.activeUser = user;
    return { success: true, user: this.sanitizeUser(user) };
  }

  getUserProfile(userId) {
    const user = this.users.find(u => u.id === userId || u.phone === userId);
    return user ? this.sanitizeUser(user) : null;
  }

  getAllUsers() {
    return this.users.map(u => this.sanitizeUser(u));
  }

  setUserPlan(userId, plan) {
    const user = this.users.find(u => u.id === userId || u.phone === userId);
    if (user) {
      user.plan = plan; // 'free' or 'premium'
      if (plan === 'premium') {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        user.expiresAt = nextMonth.toISOString();
      } else {
        user.expiresAt = null;
      }
      this.save();
      return { success: true, user: this.sanitizeUser(user) };
    }
    return { success: false, error: 'User not found' };
  }

  incrementUserCodeCount(userId) {
    const user = this.users.find(u => u.id === userId || u.phone === userId);
    if (user) {
      user.codeGenerationsCount = (user.codeGenerationsCount || 0) + 1;
      this.save();
      return user.codeGenerationsCount;
    }
    return 0;
  }

  sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // --- Notifications ---
  addNotification(targetUserId, title, message) {
    const notif = {
      id: 'notif_' + Date.now(),
      userId: targetUserId || null, // null = broadcast to all
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.save();
    return notif;
  }

  getNotificationsForUser(userId) {
    return this.notifications.filter(n => n.userId === null || n.userId === userId);
  }

  // --- Fixture Analytics Cache ---
  getFixtureAnalytics(cacheKey) {
    const cached = this.fixturesCache.get(cacheKey);
    if (!cached) return null;
    const age = Date.now() - (cached.cachedAt || 0);
    if (age > 6 * 60 * 60 * 1000) {
      this.fixturesCache.delete(cacheKey);
      this.save();
      return null;
    }
    return cached.data;
  }

  saveFixtureAnalytics(cacheKey, data) {
    this.fixturesCache.set(cacheKey, { cachedAt: Date.now(), data });
    this.save();
  }

  // --- Booked Bets History ---
  addBookedBet(bet) {
    const exists = this.bookedBets.find(b => b.code === bet.code);
    if (!exists) {
      const betRecord = {
        id: 'bet_' + Date.now(),
        code: bet.code,
        stake: bet.stake || '1,000.00',
        bookmaker: bet.bookmaker || 'Sportsbook',
        timestamp: bet.timestamp || new Date().toISOString()
      };
      this.bookedBets.unshift(betRecord);
      if (this.bookedBets.length > 100) this.bookedBets = this.bookedBets.slice(0, 100);
      this.save();
      return betRecord;
    }
    return exists;
  }

  getBookedBets() {
    return this.bookedBets;
  }
}

module.exports = new BetLensDB();
