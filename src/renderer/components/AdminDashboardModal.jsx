import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Crown, Send, RefreshCw, X, AlertCircle, Check, Search, Bell } from 'lucide-react';
import betlensApi from '../betlens-api';

export default function AdminDashboardModal({ isOpen, onClose, adminUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Notification form state
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await betlensApi.adminGetUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleTogglePlan = async (userId, currentPlan) => {
    const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
    const res = await betlensApi.adminSetUserPlan(userId, newPlan);
    if (res && res.success) {
      setStatusMsg(`User status updated to ${newPlan.toUpperCase()}`);
      setTimeout(() => setStatusMsg(''), 3000);
      loadUsers();
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const targetId = notifTarget === 'all' ? null : notifTarget;
    const res = await betlensApi.adminSendNotification(targetId, notifTitle, notifMessage);
    if (res) {
      setStatusMsg('Notification dispatched successfully!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.phone.includes(search) || u.role.includes(search)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Master Admin Control Center</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                  {adminUser?.phone || 'MASTER ADMIN'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">User Subscriptions & Member Notification Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 px-5 py-2 text-xs flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Body Layout: Left User Table, Right Notification Dispatcher */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* User Table (2 Cols) */}
          <div className="lg:col-span-2 border-r border-slate-800 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Registered Members ({users.length})</h4>
              </div>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search phone..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-800/80 rounded-xl bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono sticky top-0">
                  <tr>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Codes Used</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredUsers.map((u) => {
                    const isPrem = u.plan === 'premium';
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 text-white font-semibold">
                          {u.phone} {isAdmin && <span className="text-[9px] text-amber-400 font-bold ml-1">(Admin)</span>}
                        </td>
                        <td className="p-3">
                          {isPrem ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" /> PREMIUM
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-medium">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {u.codeGenerationsCount || 0} / {isPrem ? '∞' : '6'}
                        </td>
                        <td className="p-3 text-right">
                          {!isAdmin && (
                            <button
                              onClick={() => handleTogglePlan(u.id, u.plan)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                isPrem
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold shadow-md'
                              }`}
                            >
                              {isPrem ? 'Downgrade to Free' : 'Upgrade to Premium (₦1,000)'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Direct & Broadcast Notification Sender */}
          <div className="p-5 flex flex-col space-y-4 bg-slate-950/60">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Send Notification</h4>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Target Audience</label>
                <select
                  value={notifTarget}
                  onChange={(e) => setNotifTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">📢 Broadcast to All Members</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>Direct to {u.phone} ({u.plan})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Message Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Premium VIP Update"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Notification Text</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type member announcement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-1 resize-none min-h-[100px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 fill-slate-950" />
                <span>Dispatch Notification</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
