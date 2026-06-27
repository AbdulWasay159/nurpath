import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout';
import { ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight, Type, Globe, Check } from 'lucide-react';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// ── Font options ──────────────────────────────────────────────────────────────
const FONTS = [
  {
    id:           'noto',
    label:        'Noto Naskh',
    arabicSample: 'نَصٌّ',
    className:    'font-noto-arabic',
    size:         '1.5rem',
    lh:           '2.4',
    desc:         'Clean & modern',
  },
  {
    id:           'scheherazade',
    label:        'Scheherazade',
    arabicSample: 'نَصٌّ',
    className:    'font-scheherazade',
    size:         '1.6rem',
    lh:           '2.5',
    desc:         'Classical calligraphic',
  },
  {
    id:           'amiri',
    label:        'Amiri',
    arabicSample: 'نَصٌّ',
    className:    'font-amiri-quran',
    size:         '1.45rem',
    lh:           '2.3',
    desc:         'Traditional typeface',
  },
  {
    id:           'indopak',
    label:        'IndoPak',
    arabicSample: 'نَصٌّ',
    className:    'font-indopak',
    size:         '1.65rem',
    lh:           '2.8',
    desc:         'South Asian Nastaliq style',
  },
];

// ── Translation options ───────────────────────────────────────────────────────
const TRANSLATION_OPTIONS = [
  { edition: 'en.sahih',      label: 'Sahih International', lang: 'English', flag: '🇬🇧', dir: 'ltr' },
  { edition: 'en.pickthall',  label: 'Pickthall',           lang: 'English', flag: '🇬🇧', dir: 'ltr' },
  { edition: 'en.yusufali',   label: 'Yusuf Ali',           lang: 'English', flag: '🇬🇧', dir: 'ltr' },
  { edition: 'ur.jalandhry',  label: 'Jalandhry',           lang: 'Urdu',    flag: '🇵🇰', dir: 'rtl' },
  { edition: 'ur.ahmedali',   label: 'Ahmed Ali',           lang: 'Urdu',    flag: '🇵🇰', dir: 'rtl' },
  { edition: 'fr.hamidullah', label: 'Hamidullah',          lang: 'French',  flag: '🇫🇷', dir: 'ltr' },
  { edition: 'tr.diyanet',    label: 'Diyanet',             lang: 'Turkish', flag: '🇹🇷', dir: 'ltr' },
  { edition: 'de.aburida',    label: 'Abu Rida',            lang: 'German',  flag: '🇩🇪', dir: 'ltr' },
  { edition: 'id.indonesian', label: 'Indonesian',          lang: 'Indonesian', flag: '🇮🇩', dir: 'ltr' },
  { edition: 'bn.bengali',    label: 'Bengali',             lang: 'Bengali', flag: '🇧🇩', dir: 'ltr' },
  { edition: 'ru.kuliev',     label: 'Kuliev',              lang: 'Russian', flag: '🇷🇺', dir: 'ltr' },
];

// ── Settings Panel (Font + Translation) ──────────────────────────────────────
function SettingsPanel({ open, onClose, activeFont, onFontChange, activeTranslations, onTranslationToggle }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-md mx-4 mb-0 sm:mb-0 rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: '#0B1420', border: '1px solid rgba(201,168,76,0.2)', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 sticky top-0 z-10"
          style={{ background: '#0B1420', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <h2 className="text-base font-semibold text-center" style={{ color: '#EDE8D8' }}>Reader Settings</h2>
        </div>

        <div className="px-6 pt-4 pb-8 space-y-7">

          {/* Arabic Font */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: '#C9A84C' }}>
              <Type size={12} /> Arabic Font
            </p>
            <div className="space-y-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onFontChange(f.id)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition"
                  style={{
                    background: activeFont === f.id ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeFont === f.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Tick */}
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: activeFont === f.id ? 'rgba(201,168,76,0.2)' : 'transparent',
                        border: `1.5px solid ${activeFont === f.id ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {activeFont === f.id && <Check size={10} style={{ color: '#C9A84C' }} />}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium block" style={{ color: activeFont === f.id ? '#C9A84C' : '#EDE8D8' }}>
                        {f.label}
                      </span>
                      <span className="text-xs" style={{ color: '#3A4A60' }}>{f.desc}</span>
                    </div>
                  </div>
                  {/* Arabic preview in that font */}
                  <span
                    className={f.className}
                    style={{ fontSize: '1.3rem', color: activeFont === f.id ? '#C9A84C' : '#7A6130', lineHeight: 1.8 }}
                    dir="rtl"
                  >
                    {f.arabicSample}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Translations */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-2"
              style={{ color: '#2DD4BF' }}>
              <Globe size={12} /> Translations
            </p>
            <p className="text-xs mb-3" style={{ color: '#3A4A60' }}>Select up to 2 translations to show simultaneously.</p>
            <div className="space-y-2">
              {TRANSLATION_OPTIONS.map((t) => {
                const isActive = activeTranslations.includes(t.edition);
                return (
                  <button
                    key={t.edition}
                    onClick={() => onTranslationToggle(t.edition)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition"
                    style={{
                      background: isActive ? 'rgba(45,212,191,0.07)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {/* Checkbox */}
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(45,212,191,0.2)' : 'transparent',
                        border: `1.5px solid ${isActive ? '#2DD4BF' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {isActive && <Check size={10} style={{ color: '#2DD4BF' }} />}
                    </div>
                    <span className="text-lg">{t.flag}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block" style={{ color: isActive ? '#2DD4BF' : '#EDE8D8' }}>
                        {t.label}
                      </span>
                      <span className="text-xs" style={{ color: '#3A4A60' }}>{t.lang}</span>
                    </div>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

// ── Verse Card ────────────────────────────────────────────────────────────────
function VerseCard({ verse, showTranslation, activeTranslations, fontConfig, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.8) }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.08)' }}
    >
      {/* Verse number + Arabic */}
      <div className="flex items-start gap-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
        >
          {verse.number}
        </div>
        <p
          className={`${fontConfig.className} flex-1 text-right leading-loose`}
          dir="rtl"
          style={{ color: '#EDE8D8', fontSize: fontConfig.size, lineHeight: fontConfig.lh }}
        >
          {verse.arabic}
        </p>
      </div>

      {/* Translations */}
      <AnimatePresence>
        {showTranslation && activeTranslations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {activeTranslations.map((edition, i) => {
                const text = verse.translations?.[edition] || verse.translation || '';
                const meta = TRANSLATION_OPTIONS.find((t) => t.edition === edition);
                const isRtl = meta?.dir === 'rtl';
                return (
                  <div key={edition}>
                    {activeTranslations.length > 1 && (
                      <span className="text-xs font-semibold mb-1 block" style={{ color: i === 0 ? '#2DD4BF' : '#A78BFA' }}>
                        {meta?.flag} {meta?.label}
                      </span>
                    )}
                    <p
                      className={isRtl ? 'font-amiri' : ''}
                      style={{
                        color: '#9CA8BD',
                        fontSize: isRtl ? '1.05rem' : '0.875rem',
                        lineHeight: isRtl ? '2' : '1.7',
                        direction: isRtl ? 'rtl' : 'ltr',
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {text}
                    </p>
                    {i < activeTranslations.length - 1 && (
                      <div className="mt-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SurahReaderPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const surahId = parseInt(id);

  const [chapter, setChapter]                 = useState(null);
  const [verses, setVerses]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [showTranslation, setShowTranslation] = useState(true);
  const [settingsOpen, setSettingsOpen]       = useState(false);

  // Font & translation prefs (persisted in localStorage via useEffect)
  const [activeFont, setActiveFont]               = useState('noto');
  const [activeTranslations, setActiveTranslations] = useState(['en.sahih']);

  // Load saved prefs on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('quran_font');
      const savedTrans = localStorage.getItem('quran_translations');
      if (savedFont) setActiveFont(savedFont);
      if (savedTrans) setActiveTranslations(JSON.parse(savedTrans));
    } catch {}
  }, []);

  const handleFontChange = (fontId) => {
    setActiveFont(fontId);
    try { localStorage.setItem('quran_font', fontId); } catch {}
  };

  const handleTranslationToggle = (edition) => {
    setActiveTranslations((prev) => {
      let next;
      if (prev.includes(edition)) {
        // Don't allow deselecting the last one
        if (prev.length === 1) return prev;
        next = prev.filter((e) => e !== edition);
      } else {
        // Max 2 at a time
        next = [...prev.slice(-1), edition];
      }
      try { localStorage.setItem('quran_translations', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const fetchSurah = useCallback(async (sid, translations) => {
    setLoading(true);
    setError('');
    setVerses([]);
    setChapter(null);

    try {
      const editionsParam = translations.join(',');
      const res  = await fetch(`/api/quran/${sid}?translations=${editionsParam}`);
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'API error');

      setChapter(data.chapter);
      setVerses(data.verses);
    } catch {
      setError('Failed to load surah. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch when surahId or translations change
  useEffect(() => {
    if (surahId && surahId >= 1 && surahId <= 114) {
      fetchSurah(surahId, activeTranslations);
    }
  }, [surahId, activeTranslations, fetchSurah]);

  const fontConfig = FONTS.find((f) => f.id === activeFont) || FONTS[0];
  const hasPrev = surahId > 1;
  const hasNext = surahId < 114;

  const activeTranslationLabels = activeTranslations
    .map((e) => TRANSLATION_OPTIONS.find((t) => t.edition === e))
    .filter(Boolean)
    .map((t) => `${t.flag} ${t.label}`)
    .join(' · ');

  // ── Loading skeleton ──
  if (loading) {
    return (
      <AppLayout>
        <div className="mb-6">
          <div className="h-4 w-24 rounded animate-pulse mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-10 w-48 rounded-xl animate-pulse mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </AppLayout>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <AppLayout>
        <Link href="/quran" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: '#7A8FA8' }}>
          <ArrowLeft size={15} /> Back to Surahs
        </Link>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-4xl mb-4">📡</p>
          <p className="font-semibold mb-2" style={{ color: '#EDE8D8' }}>Connection Error</p>
          <p className="text-sm mb-6" style={{ color: '#7A8FA8' }}>{error}</p>
          <button
            onClick={() => fetchSurah(surahId, activeTranslations)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!chapter) return null;

  const isMakki      = chapter.revelationType === 'Meccan';
  const revLabel     = isMakki ? 'Makki' : 'Madani';
  const revColor     = isMakki ? '#C9A84C' : '#2DD4BF';
  const revBg        = isMakki ? 'rgba(201,168,76,0.12)' : 'rgba(45,212,191,0.12)';
  const showBismillah = chapter.id !== 9;

  return (
    <AppLayout>
      {/* Back */}
      <Link href="/quran" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: '#7A8FA8' }}>
        <ArrowLeft size={15} /> All Surahs
      </Link>

      {/* Surah header */}
      <div
        className="rounded-2xl p-6 mb-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(45,212,191,0.04) 100%)',
          border: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <p className={`${fontConfig.className} text-5xl mb-2`} style={{ color: '#C9A84C', lineHeight: 1.8 }}>
          {chapter.arabicName}
        </p>
        <p className="font-amiri text-xl mb-1" style={{ color: '#EDE8D8' }}>{chapter.name}</p>
        <p className="text-sm mb-3" style={{ color: '#7A8FA8' }}>{chapter.meaning}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: revBg, color: revColor }}>
            {revLabel}
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            {chapter.versesCount} Ayahs
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            Surah {chapter.id}
          </span>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        {/* Active settings summary */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.08)', color: '#7A6130' }}>
            {fontConfig.label}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(45,212,191,0.07)', color: '#2DD4BF' }}>
            {activeTranslationLabels}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition"
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              color: '#C9A84C',
            }}
          >
            <Type size={14} />
            <Globe size={14} />
            Settings
          </button>

          {/* Translation toggle */}
          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition"
            style={{
              background: showTranslation ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showTranslation ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.08)'}`,
              color: showTranslation ? '#2DD4BF' : '#7A8FA8',
            }}
          >
            {showTranslation ? <Eye size={14} /> : <EyeOff size={14} />}
            Translation
          </button>
        </div>
      </div>

      {/* Bismillah */}
      {showBismillah && (
        <div className="text-center py-6 mb-4">
          <p className={`${fontConfig.className} text-3xl leading-loose`} dir="rtl" style={{ color: '#C9A84C', fontSize: '1.6rem', lineHeight: 2.2 }}>
            {BISMILLAH}
          </p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-3 mb-10">
        {verses.map((verse, i) => (
          <VerseCard
            key={verse.number}
            verse={verse}
            showTranslation={showTranslation}
            activeTranslations={activeTranslations}
            fontConfig={fontConfig}
            index={i}
          />
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {hasPrev ? (
          <Link
            href={`/quran/${surahId - 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition"
            style={{ background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <ChevronLeft size={16} /> Previous
          </Link>
        ) : <div />}

        <Link href="/quran" className="text-xs px-4 py-2 rounded-xl" style={{ color: '#7A8FA8', background: 'rgba(255,255,255,0.03)' }}>
          All Surahs
        </Link>

        {hasNext ? (
          <Link
            href={`/quran/${surahId + 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition"
            style={{ background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            Next <ChevronRight size={16} />
          </Link>
        ) : <div />}
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            activeFont={activeFont}
            onFontChange={handleFontChange}
            activeTranslations={activeTranslations}
            onTranslationToggle={handleTranslationToggle}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
