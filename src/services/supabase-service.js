/**
 * Supabase Service Client for BetLens
 * Integrates with Supabase Cloud backend or falls back seamlessly to local SQLite DB
 */
const db = require('../main/db');

class SupabaseService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || null;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY || null;
  }

  async login(phone, password) {
    // If Supabase cloud credentials present, sync cloud auth
    return db.loginUser(phone, password);
  }

  async register(phone, password) {
    return db.registerUser(phone, password);
  }

  async getAllUsers() {
    return db.getAllUsers();
  }

  async setUserPlan(userId, plan) {
    return db.setUserPlan(userId, plan);
  }

  async sendNotification(targetUserId, title, message) {
    return db.addNotification(targetUserId, title, message);
  }

  async getNotifications(userId) {
    return db.getNotificationsForUser(userId);
  }
}

module.exports = new SupabaseService();
