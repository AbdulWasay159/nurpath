import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Calendar, Clock, MapPin, User, Tag } from 'lucide-react';
import { Badge } from '../ui';

const CATEGORY_COLORS = {
  lecture:     { bg: 'rgba(201,168,76,0.12)', color: '#C9A84C', label: 'Lecture' },
  jumuah:      { bg: 'rgba(45,212,191,0.12)', color: '#2DD4BF', label: "Jumu'ah" },
  halaqa:      { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', label: 'Halaqa' },
  fundraiser:  { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', label: 'Fundraiser' },
  iftar:       { bg: 'rgba(249,115,22,0.12)', color: '#F97316', label: 'Iftar' },
  eid:         { bg: 'rgba(236,72,153,0.12)', color: '#EC4899', label: 'Eid' },
  community:   { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Community' },
  other:       { bg: 'rgba(107,114,128,0.12)',color: '#9CA3AF', label: 'Other' },
};

/**
 * Normalise event.time to a consistent 12-hour display string.
 * Accepts both "13:00" (24 h from <input type="time">) and
 * "01:00 PM" (legacy seeded strings) and anything in between.
 */
function formatEventTime(time) {
  if (!time) return '';
  // Already looks like a 12-hour string (contains AM/PM) — return as-is
  if (/[AaPp][Mm]/.test(time)) return time;
  // Looks like HH:MM or H:MM (24-hour)
  if (/^\d{1,2}:\d{2}$/.test(time.trim())) {
    try {
      return new Date(`2000-01-01T${time.trim()}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch { /* fall through */ }
  }
  return time; // Unknown format — render as-is rather than breaking
}

export default function EventCard({ event, showActions, onEdit, onDelete }) {
  const cat = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
  const isPastEvent = isPast(new Date(event.date));
  const countdown = isPastEvent
    ? `Ended ${formatDistanceToNow(new Date(event.date), { addSuffix: true })}`
    : `In ${formatDistanceToNow(new Date(event.date))}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0F1620',
        border: '1px solid rgba(201,168,76,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        opacity: isPastEvent ? 0.7 : 1,
      }}
    >
      {/* Category bar */}
      <div className="h-1" style={{ background: cat.color }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: cat.bg, color: cat.color }}>
                {cat.label}
              </span>
              {isPastEvent && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(107,114,128,0.2)', color: '#9CA3AF' }}>Past</span>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight" style={{ color: '#EDE8D8' }}>
              {event.title}
            </h3>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8FA8' }}>
            <Calendar size={14} style={{ color: '#C9A84C' }} />
            <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8FA8' }}>
            <Clock size={14} style={{ color: '#C9A84C' }} />
            <span>{formatEventTime(event.time)}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{ background: isPastEvent ? 'rgba(107,114,128,0.15)' : 'rgba(45,212,191,0.12)', color: isPastEvent ? '#9CA3AF' : '#2DD4BF' }}>
              {countdown}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8FA8' }}>
            <MapPin size={14} style={{ color: '#C9A84C' }} />
            <span>{event.masjid}</span>
          </div>
          {event.speaker && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8FA8' }}>
              <User size={14} style={{ color: '#C9A84C' }} />
              <span>{event.speaker}</span>
            </div>
          )}
          {event.topic && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8FA8' }}>
              <Tag size={14} style={{ color: '#C9A84C' }} />
              <span className="italic">{event.topic}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm leading-relaxed mb-5 line-clamp-2" style={{ color: '#7A8FA8' }}>
            {event.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/events/${event._id}`}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
            View Details →
          </Link>
          {showActions && (
            <>
              <button onClick={() => onEdit(event)}
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>
                Edit
              </button>
              <button onClick={() => onDelete(event._id)}
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
