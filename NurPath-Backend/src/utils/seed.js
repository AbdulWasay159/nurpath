require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Event = require('../models/Event.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const existing = await User.findOne({ email: 'admin@nurpath.app' });
  let admin;
  if (!existing) {
    admin = await User.create({
      name: 'NurPath Admin',
      email: 'admin@nurpath.app',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin created: admin@nurpath.app / Admin@123');
  } else {
    admin = existing;
    console.log('ℹ️  Admin already exists');
  }

  // Sample events
  const sampleEvents = [
    {
      title: 'Friday Khutbah & Jumu\'ah Prayer',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '01:00 PM',
      masjid: 'Masjid Al-Noor',
      speaker: 'Sheikh Ibrahim Al-Farouqi',
      topic: 'Patience in Times of Hardship',
      description: 'Join us for the weekly Jumu\'ah prayer and a powerful khutbah on the virtue of patience (Sabr) as taught in the Quran and Sunnah.',
      category: 'jumuah',
      address: '123 Harmony Street, City Center',
      tags: ['jumuah', 'khutbah', 'weekly'],
      createdBy: admin._id,
    },
    {
      title: 'Tafseer Circle: Surah Al-Kahf',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '07:30 PM',
      masjid: 'Islamic Community Center',
      speaker: 'Ustadh Yusuf Hamdan',
      topic: 'Lessons from the People of the Cave',
      description: 'A detailed tafseer session exploring the profound lessons in Surah Al-Kahf. Suitable for all ages and knowledge levels.',
      category: 'halaqa',
      address: '456 Faith Avenue',
      tags: ['tafseer', 'quran', 'halaqa'],
      createdBy: admin._id,
    },
    {
      title: 'Community Iftar Gathering',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '06:45 PM',
      masjid: 'Masjid Al-Rahman',
      speaker: '',
      topic: 'Strengthening Community Bonds',
      description: 'A blessed community iftar to bring our brothers and sisters together. Families welcome. Please register to help us prepare.',
      category: 'iftar',
      capacity: 200,
      address: '789 Unity Road',
      tags: ['iftar', 'community', 'family'],
      createdBy: admin._id,
    },
  ];

  for (const evt of sampleEvents) {
    const exists = await Event.findOne({ title: evt.title });
    if (!exists) {
      await Event.create(evt);
      console.log(`✅ Event created: ${evt.title}`);
    }
  }

  console.log('\n🚀 Seed complete!');
  console.log('Admin login: admin@nurpath.app | Admin@123');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
