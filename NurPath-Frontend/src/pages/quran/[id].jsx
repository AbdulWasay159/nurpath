import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout';
import { ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// ── Verse Card ─────────────────────────────────────────────────────────────
function VerseCard({ verse, showTranslation, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.8) }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(201,168,76,0.08)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1"
          style={{
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            color: '#C9A84C',
          }}
        >
          {verse.verse_number}
        </div>
        <p
          className="font-amiri flex-1 text-right leading-loose"
          dir="rtl"
          style={{ color: '#EDE8D8', fontSize: '1.45rem', lineHeight: '2.2' }}
        >
          {verse.text_uthmani}
        </p>
      </div>

      <AnimatePresence>
        {showTranslation && verse.translations?.[0]?.text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p
              className="text-sm leading-relaxed mt-4 pt-4"
              style={{
                color: '#9CA8BD',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
              dangerouslySetInnerHTML={{
                __html: verse.translations[0].text.replace(/<[^>]*>/g, ''),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SurahReaderPage() {
  const router = useRouter();
  const { id } = router.query;
  const surahId = parseInt(id);

  const [chapter, setChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);

  const fetchSurah = useCallback(async (sid) => {
    setLoading(true);
    setError('');
    setVerses([]);
    setChapter(null);

    try {
      const [chapterRes, versesRes] = await Promise.all([
        fetch(`https://api.quran.com/api/v4/chapters/${sid}?language=en`),
        fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${sid}` +
          `?translations=131&fields=text_uthmani&per_page=300&page=1`
        ),
      ]);

      const chapterData = await chapterRes.json();
      const versesData  = await versesRes.json();

      if (!chapterData.chapter || !versesData.verses) {
        throw new Error('Invalid API response');
      }

      setChapter(chapterData.chapter);

      let allVerses = versesData.verses;
      const meta = versesData.meta;
      if (meta.total_pages > 1) {
        const extraFetches = [];
        for (let p = 2; p <= meta.total_pages; p++) {
          extraFetches.push(
            fetch(
              `https://api.quran.com/api/v4/verses/by_chapter/${sid}` +
              `?translations=131&fields=text_uthmani&per_page=300&page=${p}`
            ).then((r) => r.json())
          );
        }
        const extras = await Promise.all(extraFetches);
        extras.forEach((e) => { if (e.verses) allVerses = allVerses.concat(e.verses); });
      }

      setVerses(allVerses);
    } catch {
      setError('Failed to load surah. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (surahId && surahId >= 1 && surahId <= 114) {
      fetchSurah(surahId);
    }
  }, [surahId, fetchSurah]);

  const hasPrev = surahId > 1;
  const hasNext = surahId < 114;

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

  if (error) {
    return (
      <AppLayout>
        <Link href="/quran" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-yellow-400" style={{ color: '#7A8FA8' }}>
          <ArrowLeft size={15} /> Back to Surahs
        </Link>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-4xl mb-4">📡</p>
          <p className="font-semibold mb-2" style={{ color: '#EDE8D8' }}>Connection Error</p>
          <p className="text-sm mb-6" style={{ color: '#7A8FA8' }}>{error}</p>
          <button
            onClick={() => fetchSurah(surahId)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!chapter) return null;

  const revelationLabel = chapter.revelation_place === 'makkah' ? 'Makki' : 'Madani';
  const revColor = chapter.revelation_place === 'makkah' ? '#C9A84C' : '#2DD4BF';
  const revBg    = chapter.revelation_place === 'makkah' ? 'rgba(201,168,76,0.12)' : 'rgba(45,212,191,0.12)';
  const showBismillah = chapter.id !== 9;

  return (
    <AppLayout>
      <Link
        href="/quran"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-yellow-400"
        style={{ color: '#7A8FA8' }}
      >
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
        <p className="font-amiri text-5xl mb-2" style={{ color: '#C9A84C' }}>{chapter.name_arabic}</p>
        <p className="font-amiri text-xl mb-1" style={{ color: '#EDE8D8' }}>{chapter.name_simple}</p>
        <p className="text-sm mb-3" style={{ color: '#7A8FA8' }}>{chapter.translated_name?.name}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: revBg, color: revColor }}>
            {revelationLabel}
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            {chapter.verses_count} Ayahs
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            Surah {chapter.id}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A4A60' }}>
          Sahih International
        </p>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
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

      {/* Bismillah */}
      {showBismillah && (
        <div className="text-center py-6 mb-4">
          <p className="font-amiri text-3xl leading-loose" dir="rtl" style={{ color: '#C9A84C' }}>
            {BISMILLAH}
          </p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-3 mb-10">
        {verses.map((verse, i) => (
          <VerseCard key={verse.id} verse={verse} showTranslation={showTranslation} index={i} />
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {hasPrev ? (
          <Link
            href={`/quran/${surahId - 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition hover:-translate-x-0.5"
            style={{ background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <ChevronLeft size={16} /> Previous Surah
          </Link>
        ) : <div />}

        <Link href="/quran" className="text-xs px-4 py-2 rounded-xl transition" style={{ color: '#7A8FA8', background: 'rgba(255,255,255,0.03)' }}>
          All Surahs
        </Link>

        {hasNext ? (
          <Link
            href={`/quran/${surahId + 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition hover:translate-x-0.5"
            style={{ background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            Next Surah <ChevronRight size={16} />
          </Link>
        ) : <div />}
      </div>
    </AppLayout>
  );
}
