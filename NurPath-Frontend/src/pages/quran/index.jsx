import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AppLayout from '../../components/layout/AppLayout';
import { Search, BookOpen } from 'lucide-react';

const REVELATION_COLORS = {
  makkah:  { bg: 'rgba(201,168,76,0.12)',  color: '#C9A84C',  label: 'Makki'  },
  madinah: { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF',  label: 'Madani' },
};

// ── Surah Card ────────────────────────────────────────────────────────────────
function SurahCard({ chapter, index }) {
  const rev = REVELATION_COLORS[chapter.revelation_place] || REVELATION_COLORS.makkah;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.6) }}
      whileHover={{ y: -3 }}
    >
      <Link
        href={`/quran/${chapter.id}`}
        className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all group"
        style={{
          background: '#0F1620',
          border: '1px solid rgba(201,168,76,0.1)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          display: 'flex',
        }}
      >
        {/* Number circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            color: '#C9A84C',
          }}
        >
          {chapter.id}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: '#EDE8D8' }}>
              {chapter.name_simple}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: rev.bg, color: rev.color }}
            >
              {rev.label}
            </span>
          </div>
          <span className="text-xs" style={{ color: '#7A8FA8' }}>
            {chapter.translated_name?.name} · {chapter.verses_count} ayahs
          </span>
        </div>

        {/* Arabic name */}
        <div className="text-right flex-shrink-0">
          <p className="font-amiri text-xl leading-none" style={{ color: '#C9A84C' }}>
            {chapter.name_arabic}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function QuranIndexPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'makkah' | 'madinah'

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters?language=en')
      .then((r) => r.json())
      .then((data) => setChapters(data.chapters || []))
      .catch(() => setError('Failed to load surahs. Please check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chapters.filter((c) => {
      const matchesFilter = filter === 'all' || c.revelation_place === filter;
      if (!q) return matchesFilter;
      return (
        matchesFilter && (
          c.name_simple.toLowerCase().includes(q) ||
          c.name_arabic.includes(q) ||
          c.translated_name?.name?.toLowerCase().includes(q) ||
          String(c.id).includes(q)
        )
      );
    });
  }, [chapters, search, filter]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
          كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ
        </p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Al-Quran</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
          114 Surahs · Sahih International translation
        </p>
      </div>

      {/* Search + filter */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#3A4A60' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, number or meaning…"
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all',     label: 'All Surahs' },
            { id: 'makkah',  label: 'Makki' },
            { id: 'madinah', label: 'Madani' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{
                background: filter === f.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === f.id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: filter === f.id ? '#C9A84C' : '#7A8FA8',
              }}
            >
              {f.label}
            </button>
          ))}
          {!loading && (
            <span className="ml-auto self-center text-xs" style={{ color: '#3A4A60' }}>
              {filtered.length} surahs
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm" style={{ color: '#EF4444' }}>⚠ {error}</p>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array(20).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      )}

      {/* Surah list */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <BookOpen size={40} className="mx-auto mb-4" style={{ color: '#3A4A60' }} />
              <p className="text-sm" style={{ color: '#7A8FA8' }}>No surahs match your search.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((chapter, i) => (
                <SurahCard key={chapter.id} chapter={chapter} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
