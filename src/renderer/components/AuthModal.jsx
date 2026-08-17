import React, { useState } from 'react';
import { Phone, Lock, LogIn, UserPlus, Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sanitizePhone = (str) => {
    return str.replace(/\s+/g, '').trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = sanitizePhone(phone);
    const cleanPass = password.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (isRegister && cleanPass !== confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Registration Flow
        const res = await window.betlens.register(cleanPhone, cleanPass);
        if (res.success) {
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(res.user);
            onClose();
          }, 800);
        } else {
          setError(res.error || 'Registration failed. Phone number may already be registered.');
        }
      } else {
        // Login Flow
        const res = await window.betlens.login(cleanPhone, cleanPass);
        if (res.success) {
          setSuccessMsg('Login successful!');
          setTimeout(() => {
            onLoginSuccess(res.user);
            onClose();
          }, 500);
        } else {
          setError(res.error || 'Invalid phone number or password. Check credentials or register a new account.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-lg font-bold text-white tracking-tight">
            {isRegister ? 'Create Your BetLens Account' : 'Sign In to BetLens'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister 
              ? 'Register with your phone number to access AI predictions & bet codes' 
              : 'Enter your phone number & password to log in'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isRegister ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isRegister ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-950/70 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09033675852 or 08012345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-400">
            {isRegister ? (
              <span>Already registered? {' '}
                <button type="button" onClick={() => { setIsRegister(false); setError(''); }} className="text-cyan-400 font-bold hover:underline">
                  Sign In
                </button>
              </span>
            ) : (
              <span>Need an account? {' '}
                <button type="button" onClick={() => { setIsRegister(true); setError(''); }} className="text-cyan-400 font-bold hover:underline">
                  Register Now
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
