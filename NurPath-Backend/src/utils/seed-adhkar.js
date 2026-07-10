require('dotenv').config();
const mongoose = require('mongoose');
const Adhkar = require('../models/Adhkar.model');

const ADHKAR_DATA = [
  {
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا النَّهَارِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا النَّهَارِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration: "Aṣbaḥnā wa aṣbaḥal-mulku lillāhi walḥamdu lillāhi, wa lā ilāha illallāhu waḥdahū lā sharīka lahū, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Rabbi as'aluka khayra mā fī hāzan-nahāri wa khayra mā ba'dahū wa a'ūzu bika min sharri mā fī hāzan-nahāri wa sharri mā ba'dahū, Rabbi a'ūzu bika minal-kasali, wa sū'il-kibari, Rabbi a'ūzu bika min 'azābin fin-nāri wa 'azābin fil-qabri.",
    translation: 'We have entered a new day and with it all dominion is Allāh\'s. All praise is for Allāh. None has the right to be worshipped but Allāh alone, Who has no partner. To Allāh belongs the dominion, and to Him is the praise and He is Able to do all things. My Lord, I ask You for the goodness of this day and of the days that come after it, and I seek refuge in You from the evil of this day and of the days that come after it. My Lord, I seek refuge in You from laziness and helpless old age. My Lord, I seek refuge in You from the punishment of Hell-fire, and from the punishment of the grave.',
    count: 1,
    timing: ['morning'],
    virtue: 'Abdullah ibn Mas\'ood said that the Messenger of Allāh used to recite these Du\'ās every Morning and Evening.',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5081; Jami\' at-Tirmidhi, Book 48, Hadith 3391',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Fajr prayer until before Dhuhr',
    benefits: 'Seeking goodness in the day, protection from evil, refuge from laziness and old age, protection from Hell-fire and grave punishment',
  },
  {
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration: "Amsaynā wa amsal-mulku lillāh walḥamdu lillāhi, wa lā ilāha illallāhu waḥdahū lā sharīka lahū, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Rabbi as'aluka khayra mā fī hāzihil-laylati, wa khayra mā ba'dahā, wa a'ūzu bika min sharri mā fī hāzihil-laylati wa sharri mā ba'dahā. Rabbi a'ūzu bika minal-kasali, wa sū'il-kibari, Rabbi a'ūzu bika min 'azābin fin-nāri wa 'azābin fil-qabri.",
    translation: 'We have entered into the evening and with it all dominion is Allāh\'s. All praise is for Allāh. None has the right to be worshipped but Allāh alone, Who has no partner. To Allāh belongs the dominion, and to Him is the praise and He is Able to do all things. My Lord, I ask You for the goodness of this night and of the nights that come after it, and I seek refuge in You from the evil of this night and of the nights that come after it. My Lord, I seek refuge in You from laziness and helpless old age. My Lord, I seek refuge in You from the punishment of Hell-fire, and from the punishment of the grave.',
    count: 1,
    timing: ['evening'],
    virtue: "Abdullah ibn Mas'ood said that the Messenger of Allāh used to recite these Du'ās every Morning and Evening.",
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5082; Jami\' at-Tirmidhi, Book 48, Hadith 3392',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Asr prayer until before Maghrib',
    benefits: 'Seeking goodness in the night, protection from evil, refuge from laziness and old age, protection from Hell-fire and grave punishment',
  },
  {
    arabic: 'اَللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu wa ilaykan-nushūr.',
    translation: 'O Allāh, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and by Your leave we die, and to You is our Resurrection.',
    count: 1,
    timing: ['morning'],
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3393',
    authenticity: 'Hasan (Good)',
    occasion: 'After Fajr prayer',
    benefits: 'Acknowledging dependence on Allāh for life and death, remembrance of resurrection',
  },
  {
    arabic: 'اَللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Allāhumma bika amsaynā wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaykal-maṣīr.',
    translation: 'O Allāh, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and by Your leave we die, and to You is our Return.',
    count: 1,
    timing: ['evening'],
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3394',
    authenticity: 'Hasan (Good)',
    occasion: 'After Asr prayer',
    benefits: 'Acknowledging dependence on Allāh for life and death, remembrance of final return to Allāh',
  },
  {
    arabic: 'اَللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūzu bika min sharri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u laka bizanbī faghfir lī fa'innahū lā yaghfiruz-zunūba illā Anta.",
    translation: "O Allāh, You are my Lord, there is none worthy of worship but You. You created me and I am your slave, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
    count: 1,
    timing: ['morning', 'evening'],
    virtue: 'The Messenger of Allāh said about this Du\'ā, "Whoever recites this with conviction in the evening and dies during that night shall enter Paradise, and whoever recites it with conviction in the morning and dies during that day shall enter Paradise."',
    reference: 'Sahih al-Bukhari, Book 75, Hadith 5947; Sunan at-Tirmidhi, Book 48, Hadith 3393',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, particularly before sleep',
    benefits: 'Forgiveness of sins, entry to Paradise, acknowledgment of Allāh\'s lordship and mercy',
  },
  {
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "A'ūzu billāhi minash-Shayṭānir-rajīm. Allāhu lāa ilāha illā Huwal-Ḥayyul-Qayyūmu, lā ta'khuzuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-ardh, mann-ẓallaẓī yashfa'u 'indahū illā bi'iznih, ya'lamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bishay'im-min 'ilmihī illā bimā shāa'a, wasi'a kursiyyuhus-samāwāti wal-ardh, wa lā ya'ūduhū ḥifẓuhumā, wa Huwal-'Aliyyul-'Aẓīm.",
    translation: "I seek refuge in Allāh from Satan the outcast. {Allāh! There is none worthy of worship but He, the Ever Living, the One Who sustains and protects all that exists. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never encompass anything of His Knowledge except that which He wills. His Kursī (foot stool) extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Greatest.}",
    count: 1,
    timing: ['morning', 'evening'],
    virtue: '"Whoever says this when he rises in the morning will be protected from jinns until he retires in the evening, and whoever says it when retiring in the evening will be protected from them until he rises in the morning."',
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3388; Sunan Ibn Majah, Book 5, Hadith 1313',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Fajr and before sleep',
    benefits: 'Protection from jinn and evil, remembrance of Allāh\'s greatness and knowledge, spiritual protection',
  },
  {
    arabic: 'اَللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
    transliteration: "Allāhumma 'Ālimal-ghaybi wash-shahādati fāṭiras-samāwāti wal ardhi, Rabba kulli shay'in wa malīkahū, ashhadu an lā ilāha illā Anta, a'ūzu bika min sharri nafsī, wa min sharrish-shayṭāni wa shirkihī, wa an aqtarifa 'alā nafsī sū'an, aw ajurrahū ilā Muslimin.",
    translation: 'O Allāh, Knower of the unseen & the evident, Maker of the heavens and the earth, Lord of everything and its Possessor, I bear witness that there is none worthy of worship but You. I seek refuge in You from the evil of my soul and from the evil of Satan & his helpers. (I seek refuge in You) from bringing evil upon my soul & from harming any Muslim.',
    count: 1,
    timing: ['morning', 'evening'],
    virtue: 'Abu Bakr asked the Messenger of Allāh to teach him words to recite in the morning and in the evening. The Messenger of Allāh instructed him to recite this Du\'ā and added: "Recite these words in the morning and the evening and when you go to bed."',
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3392; Sunan Abu Dāwūd, Book 41, Hadith 5086',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning, evening, and before sleep',
    benefits: 'Refuge from evil of self and Satan, protection from harming others, acknowledgment of Allāh\'s knowledge and lordship',
  },
  {
    arabic: 'اَللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اَللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اَللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اَللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
    transliteration: "Allāhumma innī as'alukal-'afwa wal 'āfiyata fid-dunyā wal ākhirati, Allāhumma innī as'alukal-'afwa wal 'āfiyata fī dīnī wa dunyāya wa ahlī, wa māli, Allāhum-mastur 'awrātī, wa āmin raw'ātī, Allāhumma iḥfaẓnī min bayni yadayya wa min khalfī wa 'an yamīnī wa 'an shimālī wa min fawqī wa a'ūzu bi'aẓmatika an ughtāla min taḥtī.",
    translation: 'O Allāh, I seek Your forgiveness and well-being in this world and the next. O Allāh, I seek Your forgiveness and well-being in my religion, in my worldly affairs, in my family and in my wealth. O Allāh, conceal my secrets and preserve me from anguish. O Allāh, guard me from the front and from behind and on my right and on my left and from above. I seek refuge in Your Greatness from being struck down from beneath me.',
    count: 1,
    timing: ['morning', 'evening'],
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5074; Sunan at-Tirmidhi, Book 48, Hadith 3391',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening',
    benefits: 'Seeking forgiveness and well-being, protection from all directions, concealment of faults, preservation from fear',
  },
  {
    arabic: 'اَللَّهُمَّ عَافِنِي فِي بَدَنِي، اَللَّهُمَّ عَافِنِي فِي سَمْعِي، اَللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ، اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allāhumma 'āfinī fī badanī, Allāhumma 'āfinī fī sam'ī, Allāhumma 'āfinī fī baṣarī, lā ilāha illā Anta. Allāhumma innī a'ūzu bika minal-kufri, wal-faqri, Allāhumma innī a'ūzu bika min 'azābil-qabri, lā ilāha illā Anta.",
    translation: 'O Allāh, grant my body health. O Allāh, grant my hearing health. O Allāh, grant my sight health. There is none worthy of worship but You. O Allāh, I seek refuge in You from disbelief and poverty. O Allāh, I seek refuge in You from the punishment of the grave. There is none worthy of worship but You.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue: 'Hazrat Anas narrated that the Messenger of Allāh advised Hazrat Fathima to read this Du\'ā every Morning and Evening.',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5090; Jami\' at-Tirmidhi, Book 48, Hadith 3395',
    authenticity: 'Hasan (Good)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Health of body, hearing, and sight; refuge from disbelief and poverty; protection from grave punishment',
  },
  {
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration: "Ya Ḥayyu ya Qayyūmu biraḥmatika astaghīṡu, aṡliḥ lī sha'nī kullahū wa lā takilnī ilā nafsī ṭarfata 'ainin.",
    translation: "O Ever Living One, O Eternal One, by Your mercy I call on You to set right all my affairs. Do not place me in charge of my soul even for the blinking of an eye (i.e. a moment).",
    count: 1,
    timing: ['morning', 'evening'],
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3524; Sunan Ibn Majah, Book 5, Hadith 3882',
    authenticity: 'Hasan (Good)',
    occasion: 'Morning and evening',
    benefits: 'Seeking help through Allāh\'s mercy, rectification of all affairs, reliance on Allāh rather than self',
  },
];

const seedAdhkar = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing adhkar
    await Adhkar.deleteMany({});
    console.log('🗑️  Existing adhkar cleared');

    // Insert new adhkar
    await Adhkar.insertMany(ADHKAR_DATA);
    console.log(`✅ ${ADHKAR_DATA.length} enhanced adhkar entries seeded`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedAdhkar();
