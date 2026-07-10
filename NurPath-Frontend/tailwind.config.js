/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      colors: {
        // ── All color tokens point to CSS variables ──────────────────
        // This means Tailwind classes like text-primary, bg-card etc
        // automatically respond to the light/dark theme switch.
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted:     'var(--text-muted)',
        gold: {
          DEFAULT: 'var(--gold)',
          light:   'var(--gold-light)',
          dim:     'var(--gold-dim)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
        },
        // Backgrounds
        deep:    'var(--bg-deep)',
        card:    'var(--bg-card)',
        surface: 'var(--bg-surface)',
        hover:   'var(--bg-hover)',
        input:   'var(--bg-input)',
        // Legacy aliases so nothing breaks
        cream:   'var(--text-primary)',
        // Status colours (fixed, not theme-sensitive)
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        purple:  '#A78BFA',
      },
      borderColor: {
        theme:  'var(--border)',
        hover:  'var(--border-hover)',
        subtle: 'var(--border-subtle)',
      },
      placeholderColor: {
        muted: 'var(--text-muted)',
      },
      backgroundImage: {
        'islamic-pattern': "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A84C' stroke-width='0.4' stroke-opacity='0.05'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40Z'/%3E%3Cpath d='M40 20 L60 40 L40 60 L20 40Z'/%3E%3C/g%3E%3C/svg%3E\")",
        'gold-radial':    'radial-gradient(ellipse at 15% 15%, rgba(201,168,76,0.08) 0%, transparent 55%)',
        'teal-radial':    'radial-gradient(ellipse at 85% 85%, rgba(45,212,191,0.06) 0%, transparent 55%)',
        'card-gradient':  'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        gold:    '0 0 40px rgba(201,168,76,0.08)',
        'gold-sm': '0 0 20px rgba(201,168,76,0.12)',
        card:    '0 4px 24px rgba(0,0,0,0.2)',
        teal:    '0 0 20px rgba(45,212,191,0.15)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        float:       'float 3s ease-in-out infinite',
        'ring-fill': 'ringFill 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up':  'slideUp 0.4s ease-out',
        'fade-in':   'fadeIn 0.3s ease-out',
        shimmer:     'shimmer 1.5s infinite',
        'pulse-gold':'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        float:    { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGold:{ '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.3)' }, '50%': { boxShadow: '0 0 0 8px rgba(201,168,76,0)' } },
      },
    },
  },
  plugins: [],
};
