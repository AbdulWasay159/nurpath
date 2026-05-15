import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// ── Card ──
export function Card({ children, className = '', glow = false, style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: '#0F1620',
        border: '1px solid rgba(201,168,76,0.12)',
        boxShadow: glow ? '0 0 40px rgba(201,168,76,0.06), 0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Button ──
export function Button({ children, variant = 'gold', size = 'md', className = '', disabled, onClick, type = 'button', loading = false }) {
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };
  const variants = {
    gold: { background: 'linear-gradient(135deg, #C9A84C 0%, #A8782A 100%)', color: '#1A1000' },
    outline: { background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)' },
    ghost: { background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.12)' },
    danger: { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' },
    teal: { background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${sizes[size]} ${className}`}
      style={variants[variant]}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}

// ── Skeleton ──
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ minHeight: 20, ...style }}
    />
  );
}

// ── Badge ──
export function Badge({ children, variant = 'gold' }) {
  const variants = {
    gold: 'badge badge-gold',
    teal: 'badge badge-teal',
    green: 'badge badge-green',
    red: 'badge badge-red',
    gray: 'badge badge-gray',
  };
  return <span className={variants[variant]}>{children}</span>;
}

// ── Modal ──
export function Modal({ open, onClose, title, children, maxWidth = '500px' }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="w-full rounded-3xl"
        style={{ maxWidth, background: '#0F1620', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: 'rgba(201,168,76,0.08)' }}>
          <h3 className="font-amiri text-xl" style={{ color: '#C9A84C' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#7A8FA8' }}>
            <X size={20} />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ── Input field ──
export function Input({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A8FA8' }}>
          {label}
        </label>
      )}
      <input className="input-field" {...props} />
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── Textarea ──
export function Textarea({ label, error, rows = 4, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A8FA8' }}>
          {label}
        </label>
      )}
      <textarea className="input-field resize-none" rows={rows} {...props} />
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── Select ──
export function Select({ label, error, options = [], ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A8FA8' }}>
          {label}
        </label>
      )}
      <select className="input-field" style={{ background: '#111B28' }} {...props}>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── Stat card ──
export function StatCard({ icon, label, value, sub, color = '#C9A84C' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#3A4A60', fontWeight: 600 }}>{label}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: '#7A8FA8' }}>{sub}</p>}
        </div>
        <div className="text-2xl p-3 rounded-xl" style={{ background: `${color}15` }}>{icon}</div>
      </div>
    </Card>
  );
}

// ── Page header ──
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 className="font-amiri text-3xl" style={{ color: '#C9A84C' }}>{title}</h1>
        {subtitle && <p className="mt-1 text-sm" style={{ color: '#7A8FA8' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ── Empty state ──
export function EmptyState({ icon = '🕌', title, subtitle }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-amiri text-xl mb-2" style={{ color: '#C9A84C' }}>{title}</h3>
      {subtitle && <p className="text-sm" style={{ color: '#7A8FA8' }}>{subtitle}</p>}
    </div>
  );
}
