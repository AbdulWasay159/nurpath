import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getAzkarForPrayer } from '../../lib/azkar';

const PRAYER_LABEL = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

export default function AzkarModal({ open, onClose, prayerName }) {
  const [index, setIndex] = useState(0);
  if (!open) return null;

  const list = getAzkarForPrayer(prayerName);
  const item = list[index];
  const isLast = index === list.length - 1;
  const isFirst = index === 0;

  const handleClose = () => { setIndex(0); onClose(); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="w-full rounded-3xl overflow-hidden"
          style={{ maxWidth: 560, background: '#0F1620', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5"
            style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.04)' }}>
            <div className="flex items-center gap-2.5">
              <BookOpen size={17} style={{ color: '#C9A84C' }} />
              <div>
                <h3 className="font-amiri text-lg leading-tight" style={{ color: '#C9A84C' }}>
                  Azkar after {PRAYER_LABEL[prayerName] || 'Salah'}
                </h3>
                <p className="text-xs" style={{ color: '#3A4A60' }}>{index + 1} of {list.length}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#7A8FA8' }}>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-7 py-7 min-h-[220px] flex flex-col justify-center text-center">
            <p className="font-amiri text-2xl leading-loose mb-4" dir="rtl" style={{ color: '#EDE8D8' }}>
              {item.arabic}
            </p>
            <p className="text-sm italic mb-3" style={{ color: '#C9A84C' }}>{item.transliteration}</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#9CA8BD' }}>{item.meaning}</p>
            {item.note && (
              <p className="text-xs mb-2 font-semibold" style={{ color: '#F59E0B' }}>{item.note}</p>
            )}
            {item.repeat && (
              <span className="inline-block mx-auto mt-1 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                Recite {item.repeat}×
              </span>
            )}
            <p className="text-xs mt-4" style={{ color: '#3A4A60' }}>{item.source}</p>
          </div>

          {/* Footer / navigation */}
          <div className="flex items-center justify-between px-7 py-5" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={isFirst}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-30"
              style={{ color: '#7A8FA8', background: 'rgba(255,255,255,0.03)' }}>
              <ChevronLeft size={15} /> Back
            </button>

            <div className="flex gap-1.5">
              {list.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all"
                  style={{ width: i === index ? 18 : 6, background: i === index ? '#C9A84C' : 'rgba(255,255,255,0.12)' }} />
              ))}
            </div>

            {isLast ? (
              <button onClick={handleClose}
                className="text-sm font-bold px-5 py-2 rounded-xl transition"
                style={{ background: '#C9A84C', color: '#1A1000' }}>
                Done
              </button>
            ) : (
              <button onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition"
                style={{ color: '#C9A84C', background: 'rgba(201,168,76,0.1)' }}>
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
