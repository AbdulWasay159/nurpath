import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Calendar, BookOpen, BarChart2, User, LogOut,
  Menu, X, Bell, ShieldCheck, Moon,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/prayers', label: 'Prayers', icon: Moon },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/history', label: 'History', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
];

export default function Navbar({ notifications = 0 }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-50"
        style={{ background: '#0A1018', borderRight: '1px solid rgba(201,168,76,0.1)' }}>
        
        {/* Brand */}
        <div className="px-6 py-7 border-b" style={{ borderColor: 'rgba(201,168,76,0.08)' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.5))' }}>☽</span>
            <div>
              <div className="font-amiri text-xl" style={{ color: '#C9A84C' }}>NurPath</div>
              <div className="text-xs" style={{ color: '#3A4A60' }}>نور الطريق</div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive(href)
                  ? 'text-white'
                  : 'hover:text-cream'
                }`}
              style={isActive(href)
                ? { background: 'rgba(201,168,76,0.12)', color: '#C9A84C', borderLeft: '2px solid #C9A84C' }
                : { color: '#7A8FA8' }
              }
            >
              <Icon size={18} className={isActive(href) ? '' : 'group-hover:text-gold'} />
              {label}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mt-2
                ${isActive('/admin') ? '' : ''}`}
              style={isActive('/admin')
                ? { background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', borderLeft: '2px solid #2DD4BF' }
                : { color: '#7A8FA8' }
              }
            >
              <ShieldCheck size={18} />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Bottom user panel */}
        <div className="px-4 pb-6 space-y-2">
          <Link href="/notifications" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
            style={{ color: '#7A8FA8' }}>
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
            {notifications > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#C9A84C', color: '#1A1000' }}>
                {notifications}
              </span>
            )}
          </Link>

          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
            style={{ color: '#7A8FA8' }}>
            <User size={18} />
            Profile
          </Link>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-red-900/20"
            style={{ color: '#EF4444' }}>
            <LogOut size={18} />
            Logout
          </button>

          {/* User chip */}
          <div className="px-4 pt-3 mt-2 border-t" style={{ borderColor: 'rgba(201,168,76,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#EDE8D8' }}>{user?.name}</div>
                <div className="text-xs capitalize" style={{ color: '#3A4A60' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(8,13,19,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">☽</span>
          <span className="font-amiri text-lg" style={{ color: '#C9A84C' }}>NurPath</span>
        </Link>
        <div className="flex items-center gap-3">
          {notifications > 0 && (
            <Link href="/notifications">
              <div className="relative">
                <Bell size={20} style={{ color: '#7A8FA8' }} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: '#C9A84C', color: '#1A1000' }}>{notifications}</span>
              </div>
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: '#7A8FA8' }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-40 px-4 py-4"
            style={{ background: '#0A1018', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
          >
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={isActive(href)
                    ? { background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }
                    : { color: '#7A8FA8' }
                  }>
                  <Icon size={18} />{label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#2DD4BF' }}>
                  <ShieldCheck size={18} />Admin Panel
                </Link>
              )}
              <div className="border-t pt-2 mt-2" style={{ borderColor: 'rgba(201,168,76,0.08)' }}>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#7A8FA8' }}>
                  <User size={18} />Profile
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#EF4444' }}>
                  <LogOut size={18} />Logout
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
