// Adhkar recited after the obligatory prayers — sourced from Sahih al-Bukhari,
// Sahih Muslim, Abu Dawud and Tirmidhi. These are classical texts of remembrance,
// not modern copyrighted content.

export const AZKAR_AFTER_SALAH = [
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ',
    transliteration: "Astaghfirullah (x3)",
    meaning: 'I seek forgiveness from Allah.',
    repeat: 3,
    source: 'Sahih Muslim',
  },
  {
    id: 'allahumma-salaam',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: "Allahumma antas-salaamu wa minkas-salaam, tabaarakta yaa dhal-jalaali wal-ikraam",
    meaning: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Glory and Honor.',
    source: 'Sahih Muslim',
  },
  {
    id: 'la-ilaha-tahlil',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay\'in qadeer',
    meaning: 'There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He is over all things capable.',
    source: 'Sahih al-Bukhari',
  },
  {
    id: 'allahumma-mani',
    arabic: 'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    transliteration: "Allahumma la mani'a lima a'tayta, wa la mu'tiya lima mana't, wa la yanfa'u dhal-jaddi minkal-jadd",
    meaning: 'O Allah, none can withhold what You give, and none can give what You withhold, and the might of any mighty one cannot benefit him against You.',
    source: 'Sahih al-Bukhari',
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَهَ إِلَّا اللَّهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ',
    transliteration: "La hawla wa la quwwata illa billah, la ilaha illallah, wa la na'budu illa iyyah, lahun-ni'matu wa lahul-fadlu wa lahuth-thana'ul-hasan",
    meaning: 'There is no power and no strength except with Allah. There is no god but Allah, and we worship none but Him. His is the favor, His is the grace, and His is the excellent praise.',
    source: 'Sahih Muslim',
  },
  {
    id: 'tasbih',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٣)',
    transliteration: 'SubhanAllah (x33), Alhamdulillah (x33), Allahu Akbar (x33)',
    meaning: 'Glory be to Allah, Praise be to Allah, Allah is the Greatest — 33 times each.',
    repeat: 33,
    source: 'Sahih al-Bukhari & Muslim',
  },
  {
    id: 'tahlil-100',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah... (to complete 100)",
    meaning: 'Recited once more to complete the set of 100 after the tasbih above.',
    source: 'Sahih Muslim',
  },
  {
    id: 'ayatul-kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
    transliteration: 'Ayat al-Kursi (Surah Al-Baqarah, 2:255)',
    meaning: 'The Verse of the Throne — a declaration of Allah\'s absolute sovereignty and knowledge. Recite the full verse.',
    source: "Sunan an-Nasa'i (sahih)",
  },
  {
    id: 'three-quls',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ … قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Surah Al-Ikhlas, Al-Falaq, An-Nas',
    meaning: 'The three "Quls" — recited once after each prayer, and three times each after Fajr and Maghrib.',
    source: 'Abu Dawud, Tirmidhi',
  },
];

// Extra dua recited specifically after Fajr (before speaking to anyone)
export const FAJR_EXTRA_DUA = {
  id: 'fajr-dua',
  arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
  transliteration: "Allahumma inni as'aluka 'ilman naafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
  meaning: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
  source: 'Sunan Ibn Majah (hasan)',
};

export function getAzkarForPrayer(prayerName) {
  const isFajrOrMaghrib = prayerName === 'fajr' || prayerName === 'maghrib';
  return AZKAR_AFTER_SALAH.map((item) =>
    item.id === 'three-quls' && isFajrOrMaghrib
      ? { ...item, repeat: 3, note: 'Recite each Surah 3 times after Fajr & Maghrib' }
      : item
  ).concat(prayerName === 'fajr' ? [FAJR_EXTRA_DUA] : []);
}

// ── Adapter: reshape AZKAR_AFTER_SALAH into the same field shape used by
// adhkar-enhanced.js (id, translation, count, timing, reference, authenticity,
// occasion) so the Adhkar page can render it as a third "After Namaz" tab
// alongside Morning/Evening using the same DhikrCard component.
export function getNamazAdhkar() {
  return AZKAR_AFTER_SALAH.map((item) => ({
    id: `namaz-${item.id}`,
    arabic: item.arabic,
    transliteration: item.transliteration,
    translation: item.meaning,
    count: item.repeat || 1,
    timing: ['namaz'],
    reference: item.source,
    authenticity: undefined,
    occasion: 'After each of the 5 obligatory prayers',
    benefits: item.note || undefined,
  }));
}
