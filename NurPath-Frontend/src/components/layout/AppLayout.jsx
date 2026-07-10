import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import api from '../../lib/api';

export default function AppLayout({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (!loading && requireAdmin && user?.role !== 'admin') { router.push('/dashboard'); return; }
  }, [user, loading, requireAdmin]);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then((res) => {
        const unread = res.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>☽</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading NurPath...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}>
      <Navbar notifications={unreadCount} />
      {/* Content area - offset for desktop sidebar */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" style={{ color: "var(--text-primary)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
