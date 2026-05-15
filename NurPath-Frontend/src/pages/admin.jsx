import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['lecture', 'jumuah', 'halaqa', 'fundraiser', 'iftar', 'eid', 'community', 'other'];
const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const EMPTY_EVENT = {
  title: '', speaker: '', masjid: '', date: '', time: '',
  topic: '', description: '', address: '', category: 'other', capacity: '',
};

const EMPTY_MASJID = {
  name: '', address: '', phone: '',
  timings: { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' },
  jumuahTime: '', jumuahKhatib: '',
};

const inp = "w-full p-3.5 rounded-xl bg-black/60 border border-gray-700 focus:border-yellow-600 focus:outline-none placeholder-gray-600 transition text-white text-sm";
const lbl = "block text-xs text-gray-400 uppercase tracking-widest mb-1.5";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('events');
  const [toast, setToast] = useState(null);

  // Events state
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventsFetching, setEventsFetching] = useState(true);

  // Masjids state
  const [masjidForm, setMasjidForm] = useState(EMPTY_MASJID);
  const [masjids, setMasjids] = useState([]);
  const [masjidLoading, setMasjidLoading] = useState(false);
  const [masjidsFetching, setMasjidsFetching] = useState(true);
  const [editingMasjid, setEditingMasjid] = useState(null);

  useEffect(() => {
    if (user === null) router.replace('/login');
    else if (user && user.role !== 'admin') router.replace('/dashboard');
  }, [user]);

  useEffect(() => { fetchEvents(); fetchMasjids(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatTime = (t) => {
    if (!t) return '—';
    try { return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
    catch { return t; }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  // ── Events ──────────────────────────────────────────
  const fetchEvents = async () => {
    setEventsFetching(true);
    try { const res = await api.get('/events'); setEvents(res.data.data || []); }
    catch { /* silent */ } finally { setEventsFetching(false); }
  };

  const handleEventChange = (e) =>
    setEventForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    try {
      await api.post('/events', { ...eventForm, capacity: eventForm.capacity ? Number(eventForm.capacity) : null });
      showToast('Event created! 🎉');
      setEventForm(EMPTY_EVENT);
      fetchEvents();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create event.', 'error'); }
    finally { setEventLoading(false); }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/events/${id}`); showToast('Event deleted.'); setEvents((p) => p.filter((e) => e._id !== id)); }
    catch { showToast('Failed to delete.', 'error'); }
  };

  // ── Masjids ──────────────────────────────────────────
  const fetchMasjids = async () => {
    setMasjidsFetching(true);
    try { const res = await api.get('/masjids'); setMasjids(res.data.data || []); }
    catch { /* silent */ } finally { setMasjidsFetching(false); }
  };

  const handleMasjidChange = (e) =>
    setMasjidForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTimingChange = (prayer, value) =>
    setMasjidForm((prev) => ({ ...prev, timings: { ...prev.timings, [prayer]: value } }));

  const handleMasjidSubmit = async (e) => {
    e.preventDefault();
    setMasjidLoading(true);
    try {
      if (editingMasjid) {
        await api.put(`/masjids/${editingMasjid}`, masjidForm);
        showToast('Masjid updated! 🕌');
        setEditingMasjid(null);
      } else {
        await api.post('/masjids', masjidForm);
        showToast('Masjid added! 🕌');
      }
      setMasjidForm(EMPTY_MASJID);
      fetchMasjids();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save masjid.', 'error'); }
    finally { setMasjidLoading(false); }
  };

  const startEditMasjid = (m) => {
    setEditingMasjid(m._id);
    setMasjidForm({
      name: m.name || '', address: m.address || '', phone: m.phone || '',
      timings: { ...EMPTY_MASJID.timings, ...m.timings },
      jumuahTime: m.jumuahTime || '', jumuahKhatib: m.jumuahKhatib || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingMasjid(null); setMasjidForm(EMPTY_MASJID); };

  const handleDeleteMasjid = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try { await api.delete(`/masjids/${id}`); showToast('Masjid removed.'); setMasjids((p) => p.filter((m) => m._id !== id)); }
    catch { showToast('Failed to delete.', 'error'); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 text-white">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl
            ${toast.type === 'success' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🛠️ Admin Dashboard</h1>
          <p className="text-gray-400">Manage Islamic events, announcements, and masjid timings.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[{ id: 'events', label: '📅 Events' }, { id: 'masjids', label: '🕌 Masjid Timings' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(201,168,76,0.35)' : 'transparent'}`,
                color: activeTab === tab.id ? '#C9A84C' : '#7A8FA8',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ EVENTS TAB ══ */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Create form */}
            <div className="bg-[#0F1620] border border-yellow-700/40 rounded-2xl p-8">
              <h2 className="text-xl font-semibold mb-6 text-yellow-400">＋ Create New Event</h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div><label className={lbl}>Event Title *</label>
                  <input name="title" type="text" required placeholder="e.g. Tafsir Circle — Surah Al-Kahf"
                    className={inp} value={eventForm.title} onChange={handleEventChange} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Speaker</label>
                    <input name="speaker" type="text" placeholder="Sheikh / Ustadh name"
                      className={inp} value={eventForm.speaker} onChange={handleEventChange} /></div>
                  <div><label className={lbl}>Masjid *</label>
                    <input name="masjid" type="text" required placeholder="Masjid name"
                      className={inp} value={eventForm.masjid} onChange={handleEventChange} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Date *</label>
                    <input name="date" type="date" required className={inp} value={eventForm.date} onChange={handleEventChange} /></div>
                  <div><label className={lbl}>Time *</label>
                    <input name="time" type="time" required className={inp} value={eventForm.time} onChange={handleEventChange} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Category</label>
                    <select name="category" className={inp} value={eventForm.category} onChange={handleEventChange}>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select></div>
                  <div><label className={lbl}>Capacity</label>
                    <input name="capacity" type="number" min="1" placeholder="Unlimited if blank"
                      className={inp} value={eventForm.capacity} onChange={handleEventChange} /></div>
                </div>
                <div><label className={lbl}>Topic / Subject</label>
                  <input name="topic" type="text" placeholder="e.g. The Importance of Salah"
                    className={inp} value={eventForm.topic} onChange={handleEventChange} /></div>
                <div><label className={lbl}>Address</label>
                  <input name="address" type="text" placeholder="Full address of the venue"
                    className={inp} value={eventForm.address} onChange={handleEventChange} /></div>
                <div><label className={lbl}>Description</label>
                  <textarea name="description" rows={4} placeholder="Details about the event..."
                    className={`${inp} resize-none`} value={eventForm.description} onChange={handleEventChange} /></div>
                <button type="submit" disabled={eventLoading}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-xl transition">
                  {eventLoading ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            </div>

            {/* Events list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-yellow-400">📋 All Events</h2>
                <span className="text-sm text-gray-500">{events.length} total</span>
              </div>
              {eventsFetching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#0F1620] rounded-2xl animate-pulse border border-gray-800" />)}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-[#0F1620] border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
                  <p className="text-4xl mb-3">🕌</p><p>No events yet. Create one!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[740px] overflow-y-auto pr-1">
                  {events.map((ev) => (
                    <div key={ev._id}
                      className="bg-[#0F1620] border border-gray-800 hover:border-yellow-700/40 rounded-2xl p-5 transition group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-white truncate">{ev.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400 capitalize shrink-0">{ev.category}</span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">🕌 {ev.masjid}{ev.speaker ? ` · 🎤 ${ev.speaker}` : ''}</p>
                          <p className="text-sm text-gray-500 mt-1">📅 {formatDate(ev.date)} · ⏰ {ev.time}{ev.capacity ? ` · 👥 ${ev.registeredCount}/${ev.capacity}` : ''}</p>
                        </div>
                        <button onClick={() => handleDeleteEvent(ev._id, ev.title)}
                          className="text-gray-600 hover:text-red-500 transition text-xl shrink-0 opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MASJIDS TAB ══ */}
        {activeTab === 'masjids' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Masjid form */}
            <div className="bg-[#0F1620] border border-yellow-700/40 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-yellow-400">
                  {editingMasjid ? '✏️ Edit Masjid' : '＋ Add Masjid'}
                </h2>
                {editingMasjid && (
                  <button onClick={cancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition">
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleMasjidSubmit} className="space-y-4">
                <div><label className={lbl}>Masjid Name *</label>
                  <input name="name" type="text" required placeholder="e.g. Masjid Al-Noor"
                    className={inp} value={masjidForm.name} onChange={handleMasjidChange} /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Address</label>
                    <input name="address" type="text" placeholder="Street address"
                      className={inp} value={masjidForm.address} onChange={handleMasjidChange} /></div>
                  <div><label className={lbl}>Phone</label>
                    <input name="phone" type="text" placeholder="Contact number"
                      className={inp} value={masjidForm.phone} onChange={handleMasjidChange} /></div>
                </div>

                {/* Prayer timings */}
                <div>
                  <label className={lbl}>Prayer Timings</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRAYER_NAMES.map((p) => (
                      <div key={p} className="text-center">
                        <div className="text-xs text-gray-500 capitalize mb-1.5">{p}</div>
                        <input type="time"
                          className="w-full p-2 rounded-xl bg-black/60 border border-gray-700 focus:border-yellow-600 focus:outline-none text-center text-white text-xs transition"
                          value={masjidForm.timings[p]}
                          onChange={(e) => handleTimingChange(p, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Jumu'ah Time</label>
                    <input name="jumuahTime" type="time" className={inp}
                      value={masjidForm.jumuahTime} onChange={handleMasjidChange} /></div>
                  <div><label className={lbl}>Jumu'ah Khatib</label>
                    <input name="jumuahKhatib" type="text" placeholder="Sheikh name"
                      className={inp} value={masjidForm.jumuahKhatib} onChange={handleMasjidChange} /></div>
                </div>

                <button type="submit" disabled={masjidLoading}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-xl transition">
                  {masjidLoading ? 'Saving...' : editingMasjid ? 'Update Masjid' : 'Add Masjid'}
                </button>
              </form>
            </div>

            {/* Masjids list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-yellow-400">🕌 Registered Masjids</h2>
                <span className="text-sm text-gray-500">{masjids.length} total</span>
              </div>
              {masjidsFetching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#0F1620] rounded-2xl animate-pulse border border-gray-800" />)}
                </div>
              ) : masjids.length === 0 ? (
                <div className="bg-[#0F1620] border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
                  <p className="text-4xl mb-3">🕌</p><p>No masjids added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {masjids.map((m) => (
                    <div key={m._id}
                      className="bg-[#0F1620] border border-gray-800 hover:border-yellow-700/30 rounded-2xl p-5 transition group">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-white text-base">{m.name}</h3>
                          {m.address && <p className="text-xs text-gray-500 mt-0.5">📍 {m.address}</p>}
                          {m.phone && <p className="text-xs text-gray-600 mt-0.5">📞 {m.phone}</p>}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => startEditMasjid(m)}
                            className="text-xs text-yellow-500 hover:text-yellow-400 border border-yellow-700/40 px-3 py-1.5 rounded-lg transition">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteMasjid(m._id, m.name)}
                            className="text-xs text-red-500 hover:text-red-400 border border-red-700/40 px-3 py-1.5 rounded-lg transition">
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Timings */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {PRAYER_NAMES.map((p) => (
                          <div key={p} className="rounded-xl p-2 text-center"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-xs text-gray-500 capitalize mb-1">{p}</div>
                            <div className="text-sm font-semibold"
                              style={{ color: m.timings?.[p] ? '#C9A84C' : '#3A4A60' }}>
                              {formatTime(m.timings?.[p])}
                            </div>
                          </div>
                        ))}
                      </div>

                      {m.jumuahTime && (
                        <p className="text-xs mt-3 text-gray-500">
                          🕌 Jumu'ah: <span className="text-yellow-600 font-medium">{formatTime(m.jumuahTime)}</span>
                          {m.jumuahKhatib && ` · ${m.jumuahKhatib}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
