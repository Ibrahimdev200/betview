const { createClient } = require('@supabase/supabase-js');
const db = require('../main/db');

class SupabaseService {
  constructor() {
    this.url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
    this.key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || null;
    this.client = null;

    if (this.url && this.key) {
      try {
        this.client = createClient(this.url, this.key);
        console.log('[SupabaseService] Connected to cloud Supabase backend:', this.url);
      } catch (err) {
        console.error('[SupabaseService] Failed to initialize Supabase client:', err);
      }
    } else {
      console.log('[SupabaseService] No Supabase credentials found. Running in hybrid local DB mode.');
    }
  }

  async login(phone, password) {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone)
          .eq('password_hash', cleanPass)
          .single();

        if (!error && data) {
          return {
            success: true,
            user: {
              id: data.id,
              phone: data.phone,
              role: data.role,
              plan: data.plan,
              codeGenerationsCount: data.code_generations_count || 0,
              expiresAt: data.expires_at,
              createdAt: data.created_at
            }
          };
        }
      } catch (e) {
        console.warn('[SupabaseService] Cloud login fallback to local DB:', e.message);
      }
    }

    // Fallback to local DB storage
    return db.loginUser(cleanPhone, cleanPass);
  }

  async register(phone, password) {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (this.client) {
      try {
        const isMasterAdmin = cleanPhone === '09033675852';
        const { data, error } = await this.client
          .from('profiles')
          .insert([
            {
              phone: cleanPhone,
              password_hash: cleanPass,
              role: isMasterAdmin ? 'admin' : 'user',
              plan: isMasterAdmin ? 'premium' : 'free',
              code_generations_count: 0
            }
          ])
          .select()
          .single();

        if (!error && data) {
          // Also save in local DB
          db.registerUser(cleanPhone, cleanPass);
          return {
            success: true,
            user: {
              id: data.id,
              phone: data.phone,
              role: data.role,
              plan: data.plan,
              codeGenerationsCount: data.code_generations_count || 0,
              expiresAt: data.expires_at,
              createdAt: data.created_at
            }
          };
        }
      } catch (e) {
        console.warn('[SupabaseService] Cloud register fallback to local DB:', e.message);
      }
    }

    // Fallback to local DB storage
    return db.registerUser(cleanPhone, cleanPass);
  }

  async getAllUsers() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('id, phone, role, plan, code_generations_count, expires_at, created_at')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(u => ({
            id: u.id,
            phone: u.phone,
            role: u.role,
            plan: u.plan,
            codeGenerationsCount: u.code_generations_count || 0,
            expiresAt: u.expires_at,
            createdAt: u.created_at
          }));
        }
      } catch (e) {
        console.warn('[SupabaseService] Cloud getAllUsers fallback to local DB');
      }
    }

    return db.getAllUsers();
  }

  async setUserPlan(userId, plan) {
    if (this.client) {
      try {
        const nextMonth = plan === 'premium' ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : null;
        await this.client
          .from('profiles')
          .update({ plan, expires_at: nextMonth })
          .eq('id', userId);
      } catch (e) {
        console.warn('[SupabaseService] Cloud setUserPlan fallback to local DB');
      }
    }

    return db.setUserPlan(userId, plan);
  }

  async sendNotification(targetUserId, title, message) {
    if (this.client) {
      try {
        await this.client
          .from('notifications')
          .insert([{ user_id: targetUserId, title, message }]);
      } catch (e) {
        console.warn('[SupabaseService] Cloud sendNotification fallback to local DB');
      }
    }

    return db.addNotification(targetUserId, title, message);
  }

  async getNotifications(userId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('notifications')
          .select('*')
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('[SupabaseService] Cloud getNotifications fallback to local DB');
      }
    }

    return db.getNotificationsForUser(userId);
  }
}

module.exports = new SupabaseService();
