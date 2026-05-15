import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Calendar, BarChart2, Bell, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Moon, title: 'Daily Salah Tracker', desc: 'Mark all 5 daily prayers with beautiful animated cards. Track done, missed, or qaḍā with one tap.' },
  { icon: Calendar, title: 'Masjid Events', desc: 'Browse upcoming lectures, Jumu\'ah, iftar gatherings, and community events — with countdown timers.' },
  { icon: BarChart2, title: 'Statistics & Streaks', desc: 'Visualise your prayer consistency. Build daily streaks and identify which prayers need more attention.' },
  { icon: Bell, title: 'Announcements', desc: 'Stay informed with admin-broadcast notifications about events and community news.' },
  { icon: Shield, title: 'Role-Based Accounts', desc: 'User and Admin roles. Admins manage events and send announcements; users track their worship.' },
  { icon: Zap, title: 'Islamic Quotes', desc: 'Daily motivational ayahs and hadith to keep your heart connected to Allah.' },
];

const QUOTES = [
  { text: 'Indeed, prayer prohibits immorality and wrongdoing.', source: 'Quran 29:45' },
  { text: 'Prayer is the pillar of the religion.', source: 'Hadith — Bayhaqi' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-24">
        {/* Decorative glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Crescent */}
          <motion.div
            className="text-7xl mb-6 block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.5))' }}>
            ☽
          </motion.div>

          {/* Brand */}
          <h1 className="font-amiri text-6xl md:text-7xl mb-2" style={{ color: '#C9A84C' }}>NurPath</h1>
          <p className="font-amiri text-xl mb-4" style={{ color: '#7A6130' }}>نور الطريق — Light of the Path</p>

          {/* Quote */}
          <div className="max-w-lg mx-auto mb-8 px-6 py-4 rounded-2xl"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <p className="font-amiri text-lg italic" style={{ color: '#E8C97A' }}>"{QUOTES[0].text}"</p>
            <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: '#3A4A60' }}>— {QUOTES[0].source}</p>
          </div>

          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: '#7A8FA8' }}>
            A premium Islamic platform to track your daily Salah, discover Masjid events, and build consistent worship habits.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #A8782A 100%)', color: '#1A1000' }}>
              Get Started — بسم الله
            </Link>
            <Link href="/login"
              className="px-8 py-4 rounded-xl font-medium text-base transition-all hover:-translate-y-1"
              style={{ background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-label">Features</div>
          <h2 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Everything You Need</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl"
              style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.1)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(201,168,76,0.12)' }}>
                <Icon size={20} style={{ color: '#C9A84C' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#EDE8D8' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7A8FA8' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-lg mx-auto p-10 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(45,212,191,0.05) 100%)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="font-amiri text-3xl mb-3" style={{ color: '#C9A84C' }}>Begin Your Journey</div>
          <p className="text-sm mb-6" style={{ color: '#7A8FA8' }}>Free to use. No ads. Pure niyyah.</p>
          <Link href="/register"
            className="inline-block px-8 py-4 rounded-xl font-semibold transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #A8782A 100%)', color: '#1A1000' }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t" style={{ borderColor: 'rgba(201,168,76,0.06)', color: '#3A4A60' }}>
        <p className="font-amiri text-lg mb-1" style={{ color: '#7A6130' }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <p className="text-xs">© {new Date().getFullYear()} NurPath — Built with sincerity for the Muslim community</p>
      </footer>
    </div>
  );
}
