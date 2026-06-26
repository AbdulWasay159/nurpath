import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react';

const TYPE_COLORS = {
  info:    { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6',  icon: 'ℹ️' },
  success: { bg: 'rgba(34,197,94,0.1)',    color: '#22C55E',  icon: '✅' },
  warning: { bg: 'rgba(249,115,22,0.1)',   color: '#F97316',  icon: '⚠️' },
  event:   { bg: 'rgba(201,168,76,0.1)',   color: '#C9A84C',  icon: '📅' },
  prayer:  { bg: 'rgba(139,92,246,0.1)',   color: '#8B5CF6',  icon: '🕌' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silent */ } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { /* silent */ }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppLayout>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
            الإشعارات
          </p>
          <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              color: '#C9A84C',
            }}>
            <Check size={14} />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-16 text-center"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <BellOff size={40} className="mx-auto mb-4" style={{ color: '#3A4A60' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#EDE8D8' }}>No notifications yet</h2>
          <p className="text-sm" style={{ color: '#7A8FA8' }}>
            You'll see updates about events, prayer reminders, and community activity here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const style = TYPE_COLORS[n.type] || TYPE_COLORS.info;
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl px-5 py-4 flex items-start gap-4 transition"
                style={{
                  background: n.isRead ? 'transparent' : style.bg,
                  border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.06)' : style.color + '30'}`,
                  opacity: n.isRead ? 0.7 : 1,
                }}>
                {/* Icon */}
                <div className="flex-shrink-0 text-xl mt-0.5">{style.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#EDE8D8' }}>{n.title || n.message}</p>
                  {n.title && n.message && (
                    <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{n.message}</p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: '#3A4A60' }}>
                    {format(new Date(n.createdAt), 'EEE, MMM d · h:mm a')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n._id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg transition hover:bg-white/10"
                      style={{ color: style.color }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    title="Delete"
                    className="p-1.5 rounded-lg transition hover:bg-white/10"
                    style={{ color: '#3A4A60' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
