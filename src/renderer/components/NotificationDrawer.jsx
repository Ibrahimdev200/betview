import React from 'react';
import { Bell, X, Info, CheckCircle2, Megaphone } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-4 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-40 overflow-hidden select-none animate-pulse-subtle">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Member Notifications</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="p-3 max-h-80 overflow-y-auto space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No new notifications.
          </div>
        ) : (
          notifications.map((n, idx) => (
            <div
              key={n.id || idx}
              className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" />
                  {n.title}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
