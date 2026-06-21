import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Skeleton } from '../../components/ui';
import api from '../../lib/api';
import { ArrowLeft, Calendar, MapPin, User, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

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

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendLoading, setAttendLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => toast.error('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleAttend = async () => {
    const newStatus = event.userAttendance === 'attending' ? 'not_attending' : 'attending';
    setAttendLoading(true);
    try {
      const res = await api.put(`/events/${id}/attend`, { status: newStatus });
      setEvent((prev) => ({ ...prev, userAttendance: newStatus, attendingCount: res.data.attendingCount }));
      toast.success(newStatus === 'attending' ? "You're attending! 🎉" : 'Removed from attending.');
    } catch {
      toast.error('Could not update attendance.');
    } finally {
      setAttendLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Skeleton style={{ height: 320, borderRadius: 18 }} />
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <Card className="p-10 text-center">
          <p className="text-4xl mb-3">🕌</p>
          <p style={{ color: '#7A8FA8' }}>This event couldn't be found.</p>
          <Link href="/events" className="inline-block mt-5">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </Card>
      </AppLayout>
    );
  }

  const cat = CAT_STYLE[event.category] || CAT_STYLE.other;
  const past = isPast(new Date(event.date));
  const distance = formatDistanceToNow(new Date(event.date), { addSuffix: true });
  const isAttending = event.userAttendance === 'attending';

  return (
    <AppLayout>
      <Link href="/events" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-yellow-400"
        style={{ color: '#7A8FA8' }}>
        <ArrowLeft size={15} /> Back to Events
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="h-1.5" style={{ background: cat.color }} />
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                style={{ background: cat.bg, color: cat.color }}>
                {event.category === 'jumuah' ? "Jumu'ah" : event.category}
              </span>
              {past && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>
                  Past
                </span>
              )}
              {isAttending && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CheckCircle size={10} />Attending
                </span>
              )}
            </div>

            <h1 className="text-2xl font-semibold mb-5" style={{ color: '#EDE8D8' }}>{event.title}</h1>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#7A8FA8' }}>
                <Calendar size={15} style={{ color: '#C9A84C' }} />
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#7A8FA8' }}>
                <Clock size={15} style={{ color: '#C9A84C' }} />
                {event.time}
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: past ? 'rgba(107,114,128,0.1)' : 'rgba(45,212,191,0.1)', color: past ? '#9CA3AF' : '#2DD4BF' }}>
                  {past ? `Ended ${distance}` : `In ${distance}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#7A8FA8' }}>
                <MapPin size={15} style={{ color: '#C9A84C' }} />
                {event.masjid}{event.address ? ` · ${event.address}` : ''}
              </div>
              {event.speaker && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: '#7A8FA8' }}>
                  <User size={15} style={{ color: '#C9A84C' }} />
                  {event.speaker}{event.topic && <span className="italic"> · "{event.topic}"</span>}
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#7A8FA8' }}>
                <Users size={15} style={{ color: '#C9A84C' }} />
                {event.attendingCount || 0} attending{event.capacity ? ` · capacity ${event.capacity}` : ''}
              </div>
            </div>

            {event.description && (
              <p className="text-sm leading-relaxed mb-7" style={{ color: '#9CA8BD' }}>{event.description}</p>
            )}

            {!past && (
              <Button
                variant={isAttending ? 'danger' : 'gold'}
                loading={attendLoading}
                disabled={attendLoading}
                onClick={toggleAttend}>
                {isAttending
                  ? <span className="flex items-center gap-2"><XCircle size={14} />Not Attending</span>
                  : <span className="flex items-center gap-2"><CheckCircle size={14} />Attend This Event</span>}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
