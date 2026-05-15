import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';

const CATEGORIES = ['all', 'lecture', 'jumuah', 'halaqa', 'fundraiser', 'iftar', 'eid', 'community', 'other'];

const CATEGORY_COLORS = {
  lecture:     'bg-blue-900/50 text-blue-300',
  jumuah:      'bg-green-900/50 text-green-300',
  halaqa:      'bg-purple-900/50 text-purple-300',
  fundraiser:  'bg-yellow-900/50 text-yellow-300',
  iftar:       'bg-orange-900/50 text-orange-300',
  eid:         'bg-pink-900/50 text-pink-300',
  community:   'bg-teal-900/50 text-teal-300',
  other:       'bg-gray-800 text-gray-400',
};

function EventCard({ event }) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  const isPast = new Date(event.date) < new Date();

  return (
    <div className={`relative bg-[#0D1520] border rounded-2xl p-6 flex flex-col gap-4 transition hover:border-yellow-700/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30
      ${isPast ? 'border-gray-800 opacity-60' : 'border-gray-700/60'}`}>

      {/* Top row: category badge + past label */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other}`}>
          {event.category}
        </span>
        {isPast && (
          <span className="text-xs text-gray-600 font-medium">Past event</span>
        )}
        {event.capacity && (
          <span className="text-xs text-gray-500">
            👥 {event.registeredCount}/{event.capacity} seats
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-white leading-snug mb-1">{event.title}</h3>
        {event.topic && (
          <p className="text-sm text-yellow-500/80 italic">"{event.topic}"</p>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>🕌</span>
          <span className="font-medium text-gray-300">{event.masjid}</span>
        </div>
        {event.speaker && (
          <div className="flex items-center gap-2">
            <span>🎤</span>
            <span>{event.speaker}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏰</span>
          <span>{event.time}</span>
        </div>
        {event.address && (
          <div className="flex items-start gap-2">
            <span>📍</span>
            <span className="leading-tight">{event.address}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 border-t border-gray-800 pt-3">
          {event.description}
        </p>
      )}

      {/* Footer */}
      {event.createdBy?.name && (
        <p className="text-xs text-gray-700 mt-auto">Posted by {event.createdBy.name}</p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#0D1520] border border-gray-800 rounded-2xl p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/4" />
      <div className="h-5 bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
      <div className="h-4 bg-gray-800 rounded w-1/3" />
      <div className="h-16 bg-gray-800 rounded w-full mt-2" />
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [category, upcomingOnly]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (upcomingOnly) params.upcoming = 'true';

      const res = await api.get('/events', { params });
      // Backend returns { success, count, data: [...] }
      setEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filter (fast, no extra API call)
  const filtered = events.filter((ev) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.masjid?.toLowerCase().includes(q) ||
      ev.speaker?.toLowerCase().includes(q) ||
      ev.topic?.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 text-white">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🕌 Islamic Events</h1>
          <p className="text-gray-400">
            Browse upcoming lectures, bayan, tafsir classes, and masjid gatherings.
          </p>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search by title, masjid, speaker..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F1620] border border-gray-700 focus:border-yellow-600 focus:outline-none text-sm placeholder-gray-600 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category select */}
          <select
            className="px-4 py-3 rounded-xl bg-[#0F1620] border border-gray-700 focus:border-yellow-600 focus:outline-none text-sm text-gray-300 capitalize transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Upcoming toggle */}
          <button
            onClick={() => setUpcomingOnly((prev) => !prev)}
            className={`px-5 py-3 rounded-xl text-sm font-medium border transition whitespace-nowrap
              ${upcomingOnly
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'bg-[#0F1620] text-gray-400 border-gray-700 hover:border-yellow-700/50'}`}
          >
            {upcomingOnly ? '✓ Upcoming Only' : 'Upcoming Only'}
          </button>
        </div>

        {/* ── Count ── */}
        {!loading && (
          <p className="text-sm text-gray-600 mb-5">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            {search ? ` for "${search}"` : ''}
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-24 space-y-3">
            <p className="text-5xl">🕌</p>
            <h2 className="text-2xl font-semibold text-gray-300">No Events Found</h2>
            <p className="text-gray-500">
              {search ? `No results for "${search}". Try a different search.` : 'Upcoming events will appear here.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-yellow-500 text-black font-medium text-sm hover:bg-yellow-400 transition"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
