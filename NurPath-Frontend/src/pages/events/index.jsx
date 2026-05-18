import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Card, EmptyState, Skeleton, Badge } from '../../components/ui';
import api from '../../lib/api';
import Link from 'next/link';
import { Search, Calendar, MapPin, User, Clock, CheckCircle, XCircle, Users, Filter } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'jumuah', label: "Jumu'ah" },
  { value: 'lecture', label: 'Lecture' },
  { value: 'halaqa', label: 'Halaqa' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'eid', label: 'Eid' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

const CAT_STYLE = {
  lecture:    { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  jumuah:     { color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)' },
  halaqa:     { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  fundraiser: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  iftar:      { color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  eid:        { color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  community:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  other:      { color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)'},
};

export default function EventsPage() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [upcoming, setUpcoming]     = useState(true);
  const [attending, setAttending]   = useState({}); // eventId → status
  const [attendLoading, setAttendLoading] = useState({});

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)              params.set('search', search);
      if (category !== 'all') params.set('category', category);
      if (upcoming)            params.set('upcoming', 'true');
      const res = await api.get(`/events?${params}`);
      setEvents(res.data.data);
      // Build attendance map
      const map = {};
      res.data.data.forEach((e) => { if (e.userAttendance) map[e._id] = e.userAttendance; });
      setAttending(map);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [search, category, upcoming]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const toggleAttend = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'attending' ? 'not_attending' : 'attending';
    setAttendLoading((p) => ({ ...p, [eventId]: true }));
    try {
      await api.put(`/events/${eventId}/attend`, { status: newStatus });
      setAttending((p) => ({ ...p, [eventId]: newStatus }));
      toast.success(newStatus === 'attending' ? "You're attending! 🎉" : "Removed from attending.");
    } catch {
      toast.error('Could not update attendance.');
    } finally {
      setAttendLoading((p) => ({ ...p, [eventId]: false }));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Masjid Events"
        subtitle="Discover lectures, Jumu'ah, community gatherings and more"
      />

      {/* Filters */}
      <div className="space-y-3 mb-7">
        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#3A4A60' }} />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, masjids, speakers…"
            className="input-field pl-10"
          />
        </div>

        {/* Category + upcoming toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={category === c.value
                  ? { background: '#C9A84C', color: '#1A1000' }
                  : { background: 'rgba(201,168,76,0.08)', color: '#7A8FA8', border: '1px solid rgba(201,168,76,0.1)' }
                }>
                {c.label}
              </button>
            ))}
          </div>
          <button onClick={() => setUpcoming(!upcoming)}
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
            style={upcoming
              ? { background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }
              : { background: 'rgba(58,74,96,0.2)', color: '#7A8FA8', border: '1px solid rgba(58,74,96,0.2)' }
            }>
            <Filter size={11} />
            {upcoming ? 'Upcoming only' : 'All dates'}
          </button>
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 280, borderRadius: 18 }} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon="🕌" title="No Events Found" subtitle="Check back later or adjust your filters." />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event, i) => {
              const cat = CAT_STYLE[event.category] || CAT_STYLE.other;
              const past = isPast(new Date(event.date));
              const distance = formatDistanceToNow(new Date(event.date), { addSuffix: true });
              const userAtt = attending[event._id];
              const isAttending = userAtt === 'attending';

              return (
                <motion.div key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.06 }}
                  layout
                  className="rounded-2xl overflow-hidden relative"
                  style={{
                    background: '#0F1620',
                    border: `1px solid ${isAttending ? 'rgba(34,197,94,0.25)' : 'rgba(201,168,76,0.1)'}`,
                    boxShadow: isAttending ? '0 0 20px rgba(34,197,94,0.06)' : '0 4px 20px rgba(0,0,0,0.3)',
                    opacity: past ? 0.75 : 1,
                  }}>

                  {/* Top color bar */}
                  <div className="h-1" style={{ background: cat.color }} />

                  {/* Attending badge */}
                  {isAttending && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <CheckCircle size={10} />Attending
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Category + past tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap pr-20">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: cat.bg, color: cat.color }}>
                        {event.category === 'jumuah' ? "Jumu'ah" : event.category}
                      </span>
                      {past && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>
                          Past
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base leading-snug mb-3" style={{ color: '#EDE8D8' }}>
                      {event.title}
                    </h3>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8FA8' }}>
                        <Calendar size={12} style={{ color: '#C9A84C' }} />
                        {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8FA8' }}>
                        <Clock size={12} style={{ color: '#C9A84C' }} />
                        {event.time}
                        <span className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: past ? 'rgba(107,114,128,0.1)' : 'rgba(45,212,191,0.1)', color: past ? '#9CA3AF' : '#2DD4BF' }}>
                          {past ? `Ended ${distance}` : `In ${distance}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8FA8' }}>
                        <MapPin size={12} style={{ color: '#C9A84C' }} />
                        {event.masjid}{event.address ? ` · ${event.address}` : ''}
                      </div>
                      {event.speaker && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8FA8' }}>
                          <User size={12} style={{ color: '#C9A84C' }} />
                          {event.speaker}
                          {event.topic && <span className="italic">· "{event.topic}"</span>}
                        </div>
                      )}
                      {event.attendingCount > 0 && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8FA8' }}>
                          <Users size={12} style={{ color: '#C9A84C' }} />
                          {event.attendingCount} attending
                        </div>
                      )}
                    </div>

                    {/* Description preview */}
                    {event.description && (
                      <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#3A4A60' }}>
                        {event.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/events/${event._id}`}
                        className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                        style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                        View Details
                      </Link>

                      {!past && (
                        <button
                          disabled={attendLoading[event._id]}
                          onClick={() => toggleAttend(event._id, userAtt)}
                          className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-1.5 disabled:opacity-50"
                          style={isAttending
                            ? { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }
                            : { background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }
                          }>
                          {isAttending
                            ? <><XCircle size={11} />Not Attending</>
                            : <><CheckCircle size={11} />Attend</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </AppLayout>
  );
}
