import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { gregorianToHijri } from '../../lib/hijri';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import {
  LayoutDashboard, BookOpen, BarChart2,
  User, LogOut, Menu, X, Bell, ShieldCheck, Moon, Clock, BookMarked, Compass,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',       label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/prayers',         label: 'Prayers',        icon: Moon },
  { href: '/adhkar',          label: 'Adhkar',         icon: BookMarked },
  { href: '/qibla',           label: 'Qibla',          icon: Compass },
  { href: '/history',         label: 'History',        icon: BookOpen },
  { href: '/stats',           label: 'Statistics',     icon: BarChart2 },
];

export default function Navbar({ notifications = 0 }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navScrollRef = useRef(null); // ref for the scrollable <nav> element
  const savedScrollRef = useRef(0);  // remembers scroll position across route changes

  // Save scroll position before route changes, restore after
  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (navScrollRef.current) {
        savedScrollRef.current = navScrollRef.current.scrollTop;
      }
    };
    const handleRouteChangeComplete = () => {
      // Use rAF so the DOM has settled before we restore position
      requestAnimationFrame(() => {
        if (navScrollRef.current) {
          navScrollRef.current.scrollTop = savedScrollRef.current;
        }
      });
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  const [menuOpen, setMenuOpen] = useState(false);
  const { hijri } = usePrayerTimes();
  const [time, setTime] = useState('');

  useEffect(() => {

    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { logout(); router.push('/login'); };
  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  const NavLink = ({ href, label, icon: Icon, teal = false, onClick }) => (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={isActive(href)
        ? {
          background: teal ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.12)',
          color: teal ? '#2DD4BF' : '#C9A84C',
          borderLeft: `2px solid ${teal ? '#2DD4BF' : '#C9A84C'}`,
        }
        : { color: 'var(--text-secondary)' }
      }>
      <Icon size={17} />
      {label}
    </Link>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-50"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>

        {/* Brand + clock */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link href="/dashboard" className="flex items-center gap-3 mb-4">
            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.6))' }}>☽</span>
            <div>
              <div className="font-amiri text-xl" style={{ color: 'var(--gold)' }}>NurPath</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>نور الطريق</div>
            </div>
          </Link>

          {/* Hijri date */}
          {hijri && (
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>
                {hijri.formattedShort} AH
              </div>
              <div className="font-amiri text-sm text-right" style={{ color: 'var(--gold-dim)' }}>
                {hijri.formattedAr}
              </div>
              {time && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav ref={navScrollRef} className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
          {user?.role === 'admin' && (
            <div className="pt-3 mt-3 border-t" style={{ borderColor: 'rgba(201,168,76,0.06)' }}>
              <NavLink href="/admin" label="Admin Panel" icon={ShieldCheck} teal />
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-0.5 border-t" style={{ borderColor: 'var(--border-subtle)', paddingTop: 12 }}>
          {/* Theme toggle row */}
          <Link href="/notifications"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-3"><Bell size={17} /><span>Notifications</span></div>
            {notifications > 0 && (
              <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#C9A84C', color: '#1A1000' }}>{notifications > 9 ? '9+' : notifications}</span>
            )}
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
            <User size={17} />Profile
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-red-900/20"
            style={{ color: '#EF4444' }}>
            <LogOut size={17} />Logout
          </button>

          {/* Avatar chip */}
          <div className="px-4 pt-3 mt-1 border-t" style={{ borderColor: 'rgba(201,168,76,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50"
        style={{ background: 'color-mix(in srgb, var(--bg-deep) 96%, transparent)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.5))' }}>☽</span>
            <div>
              <span className="font-amiri text-lg block leading-tight" style={{ color: 'var(--gold)' }}>NurPath</span>
            </div>
          </Link>

          {/* Hijri on mobile */}
          {hijri && (
            <div className="hidden sm:block text-center">
              <div className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{hijri.formattedShort}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {notifications > 0 && (
              <Link href="/notifications" className="relative">
                <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: '#C9A84C', color: '#1A1000' }}>{notifications > 9 ? '9+' : notifications}</span>
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-secondary)' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Hijri strip */}
        {hijri && (
          <div className="sm:hidden px-5 pb-2 flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{hijri.formattedShort} AH</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="font-amiri text-xs" style={{ color: 'var(--gold-dim)' }}>{hijri.formattedAr}</span>
          </div>
        )}
      </header>

      {/* ── Mobile slide-down menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed top-20 left-0 right-0 z-40 px-4 py-4 space-y-1"
            style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setMenuOpen(false)} />
            ))}
            {user?.role === 'admin' && (
              <NavLink href="/admin" label="Admin Panel" icon={ShieldCheck} teal onClick={() => setMenuOpen(false)} />
            )}
            <div className="border-t pt-2 mt-2 space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
                <User size={17} />Profile
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm" style={{ color: '#EF4444' }}>
                <LogOut size={17} />Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
