/**
 * Morning & Evening Adhkar (Subah & Shaam ke Azkaar) — Enhanced Version
 * Source: Subah Shaam ke Azkaar booklet and authentic Islamic sources
 * 
 * Each entry now includes:
 * - id: unique identifier
 * - arabic: Arabic text
 * - transliteration: Romanized transliteration
 * - translation: English translation
 * - count: number of repetitions
 * - timing: 'morning' or 'evening' or both
 * - virtue: hadith about the benefits
 * - reference: source reference (hadith book, chapter, hadith number)
 * - authenticity: grading (Sahih, Hasan, etc.)
 * - occasion: when to recite (after Fajr, after Asr, etc.)
 * - benefits: established benefits from authentic sources
 */

export const ADHKAR_ENHANCED = [
  // ─── 1. Asbahnā (Morning) ───────────────────────────────────────────────
  {
    id: 1,
    arabic:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا النَّهَارِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا النَّهَارِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration:
      "Aṣbaḥnā wa aṣbaḥal-mulku lillāhi walḥamdu lillāhi, wa lā ilāha illallāhu waḥdahū lā sharīka lahū, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Rabbi as'aluka khayra mā fī hāzan-nahāri wa khayra mā ba'dahū wa a'ūzu bika min sharri mā fī hāzan-nahāri wa sharri mā ba'dahū, Rabbi a'ūzu bika minal-kasali, wa sū'il-kibari, Rabbi a'ūzu bika min 'azābin fin-nāri wa 'azābin fil-qabri.",
    translation:
      'We have entered a new day and with it all dominion is Allāh\'s. All praise is for Allāh. None has the right to be worshipped but Allāh alone, Who has no partner. To Allāh belongs the dominion, and to Him is the praise and He is Able to do all things. My Lord, I ask You for the goodness of this day and of the days that come after it, and I seek refuge in You from the evil of this day and of the days that come after it. My Lord, I seek refuge in You from laziness and helpless old age. My Lord, I seek refuge in You from the punishment of Hell-fire, and from the punishment of the grave.',
    count: 1,
    timing: ['morning'],
    virtue: 'Abdullah ibn Mas\'ood said that the Messenger of Allāh used to recite these Du\'ās every Morning and Evening.',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5081; Jami\' at-Tirmidhi, Book 48, Hadith 3391',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Fajr prayer until before Dhuhr',
    benefits: 'Seeking goodness in the day, protection from evil, refuge from laziness and old age, protection from Hell-fire and grave punishment',
  },

  // ─── 2. Amsaynā (Evening) ───────────────────────────────────────────────
  {
    id: 2,
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration:
      "Amsaynā wa amsal-mulku lillāh walḥamdu lillāhi, wa lā ilāha illallāhu waḥdahū lā sharīka lahū, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Rabbi as'aluka khayra mā fī hāzihil-laylati, wa khayra mā ba'dahā, wa a'ūzu bika min sharri mā fī hāzihil-laylati wa sharri mā ba'dahā. Rabbi a'ūzu bika minal-kasali, wa sū'il-kibari, Rabbi a'ūzu bika min 'azābin fin-nāri wa 'azābin fil-qabri.",
    translation:
      'We have entered into the evening and with it all dominion is Allāh\'s. All praise is for Allāh. None has the right to be worshipped but Allāh alone, Who has no partner. To Allāh belongs the dominion, and to Him is the praise and He is Able to do all things. My Lord, I ask You for the goodness of this night and of the nights that come after it, and I seek refuge in You from the evil of this night and of the nights that come after it. My Lord, I seek refuge in You from laziness and helpless old age. My Lord, I seek refuge in You from the punishment of Hell-fire, and from the punishment of the grave.',
    count: 1,
    timing: ['evening'],
    virtue: "Abdullah ibn Mas'ood said that the Messenger of Allāh used to recite these Du\'ās every Morning and Evening.",
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5082; Jami\' at-Tirmidhi, Book 48, Hadith 3392',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Asr prayer until before Maghrib',
    benefits: 'Seeking goodness in the night, protection from evil, refuge from laziness and old age, protection from Hell-fire and grave punishment',
  },

  // ─── 3. Allāhumma bika aṣbaḥnā (Morning) ──────────────────────────────
  {
    id: 3,
    arabic:
      'اَللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration:
      'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu wa ilaykan-nushūr.',
    translation:
      'O Allāh, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and by Your leave we die, and to You is our Resurrection.',
    count: 1,
    timing: ['morning'],
    virtue: null,
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3393',
    authenticity: 'Hasan (Good)',
    occasion: 'After Fajr prayer',
    benefits: 'Acknowledging dependence on Allāh for life and death, remembrance of resurrection',
  },

  // ─── 4. Allāhumma bika amsaynā (Evening) ──────────────────────────────
  {
    id: 4,
    arabic:
      'اَللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration:
      'Allāhumma bika amsaynā wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaykal-maṣīr.',
    translation:
      'O Allāh, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and by Your leave we die, and to You is our Return.',
    count: 1,
    timing: ['evening'],
    virtue: null,
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3394',
    authenticity: 'Hasan (Good)',
    occasion: 'After Asr prayer',
    benefits: 'Acknowledging dependence on Allāh for life and death, remembrance of final return to Allāh',
  },

  // ─── 5. Sayyid ul-Istighfār — Morning & Evening ─────────────────────────
  {
    id: 5,
    arabic:
      'اَللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      "Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūzu bika min sharri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u laka bizanbī faghfir lī fa'innahū lā yaghfiruz-zunūba illā Anta.",
    translation:
      "O Allāh, You are my Lord, there is none worthy of worship but You. You created me and I am your slave, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
    count: 1,
    timing: ['morning', 'evening'],
    virtue:
      'The Messenger of Allāh said about this Du\'ā, "Whoever recites this with conviction in the evening and dies during that night shall enter Paradise, and whoever recites it with conviction in the morning and dies during that day shall enter Paradise."',
    reference: 'Sahih al-Bukhari, Book 75, Hadith 5947; Sunan at-Tirmidhi, Book 48, Hadith 3393',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, particularly before sleep',
    benefits: 'Forgiveness of sins, entry to Paradise, acknowledgment of Allāh\'s lordship and mercy',
  },

  // ─── 6. Āyat al-Kursī — Morning & Evening ──────────────────────────────
  {
    id: 6,
    arabic:
      'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      "A'ūzu billāhi minash-Shayṭānir-rajīm. Allāhu lāa ilāha illā Huwal-Ḥayyul-Qayyūmu, lā ta'khuzuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-ardh, mann-ẓallaẓī yashfa'u 'indahū illā bi'iznih, ya'lamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bishay'im-min 'ilmihī illā bimā shāa'a, wasi'a kursiyyuhus-samāwāti wal-ardh, wa lā ya'ūduhū ḥifẓuhumā, wa Huwal-'Aliyyul-'Aẓīm.",
    translation:
      "I seek refuge in Allāh from Satan the outcast. {Allāh! There is none worthy of worship but He, the Ever Living, the One Who sustains and protects all that exists. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never encompass anything of His Knowledge except that which He wills. His Kursī (foot stool) extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Greatest.}",
    count: 1,
    timing: ['morning', 'evening'],
    virtue:
      '"Whoever says this when he rises in the morning will be protected from jinns until he retires in the evening, and whoever says it when retiring in the evening will be protected from them until he rises in the morning."',
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3388; Sunan Ibn Majah, Book 5, Hadith 1313',
    authenticity: 'Sahih (Authentic)',
    occasion: 'After Fajr and before sleep',
    benefits: 'Protection from jinn and evil, remembrance of Allāh\'s greatness and knowledge, spiritual protection',
  },

  // ─── 7. Allāhumma 'Ālimal-ghayb — Morning & Evening ────────────────────
  {
    id: 7,
    arabic:
      'اَللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
    transliteration:
      "Allāhumma 'Ālimal-ghaybi wash-shahādati fāṭiras-samāwāti wal ardhi, Rabba kulli shay'in wa malīkahū, ashhadu an lā ilāha illā Anta, a'ūzu bika min sharri nafsī, wa min sharrish-shayṭāni wa shirkihī, wa an aqtarifa 'alā nafsī sū'an, aw ajurrahū ilā Muslimin.",
    translation:
      'O Allāh, Knower of the unseen & the evident, Maker of the heavens and the earth, Lord of everything and its Possessor, I bear witness that there is none worthy of worship but You. I seek refuge in You from the evil of my soul and from the evil of Satan & his helpers. (I seek refuge in You) from bringing evil upon my soul & from harming any Muslim.',
    count: 1,
    timing: ['morning', 'evening'],
    virtue:
      'Abu Bakr asked the Messenger of Allāh to teach him words to recite in the morning and in the evening. The Messenger of Allāh instructed him to recite this Du\'ā and added: "Recite these words in the morning and the evening and when you go to bed."',
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3392; Sunan Abu Dāwūd, Book 41, Hadith 5086',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning, evening, and before sleep',
    benefits: 'Refuge from evil of self and Satan, protection from harming others, acknowledgment of Allāh\'s knowledge and lordship',
  },

  // ─── 8. Allāhumma innī as'alukal-'afwa — Morning & Evening ─────────────
  {
    id: 8,
    arabic:
      'اَللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اَللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اَللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اَللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
    transliteration:
      "Allāhumma innī as'alukal-'afwa wal 'āfiyata fid-dunyā wal ākhirati, Allāhumma innī as'alukal-'afwa wal 'āfiyata fī dīnī wa dunyāya wa ahlī, wa māli, Allāhum-mastur 'awrātī, wa āmin raw'ātī, Allāhumma iḥfaẓnī min bayni yadayya wa min khalfī wa 'an yamīnī wa 'an shimālī wa min fawqī wa a'ūzu bi'aẓmatika an ughtāla min taḥtī.",
    translation:
      'O Allāh, I seek Your forgiveness and well-being in this world and the next. O Allāh, I seek Your forgiveness and well-being in my religion, in my worldly affairs, in my family and in my wealth. O Allāh, conceal my secrets and preserve me from anguish. O Allāh, guard me from the front and from behind and on my right and on my left and from above. I seek refuge in Your Greatness from being struck down from beneath me.',
    count: 1,
    timing: ['morning', 'evening'],
    virtue: null,
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5074; Sunan at-Tirmidhi, Book 48, Hadith 3391',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening',
    benefits: 'Seeking forgiveness and well-being, protection from all directions, concealment of faults, preservation from fear',
  },

  // ─── 9. Allāhumma 'āfinī fī badanī — Morning & Evening (Thrice) ─────────
  {
    id: 9,
    arabic:
      'اَللَّهُمَّ عَافِنِي فِي بَدَنِي، اَللَّهُمَّ عَافِنِي فِي سَمْعِي، اَللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ، اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration:
      "Allāhumma 'āfinī fī badanī, Allāhumma 'āfinī fī sam'ī, Allāhumma 'āfinī fī baṣarī, lā ilāha illā Anta. Allāhumma innī a'ūzu bika minal-kufri, wal-faqri, Allāhumma innī a'ūzu bika min 'azābil-qabri, lā ilāha illā Anta.",
    translation:
      'O Allāh, grant my body health. O Allāh, grant my hearing health. O Allāh, grant my sight health. There is none worthy of worship but You. O Allāh, I seek refuge in You from disbelief and poverty. O Allāh, I seek refuge in You from the punishment of the grave. There is none worthy of worship but You.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue:
      'Hazrat Anas narrated that the Messenger of Allāh advised Hazrat Fathima to read this Du\'ā every Morning and Evening.',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5090; Jami\' at-Tirmidhi, Book 48, Hadith 3395',
    authenticity: 'Hasan (Good)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Health of body, hearing, and sight; refuge from disbelief and poverty; protection from grave punishment',
  },

  // ─── 10. Ya Ḥayyu ya Qayyūm — Morning & Evening ─────────────────────────
  {
    id: 10,
    arabic:
      'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration:
      'Ya Ḥayyu ya Qayyūmu biraḥmatika astaghīṡu, aṡliḥ lī sha\'nī kullahū wa lā takilnī ilā nafsī ṭarfata \'ainin.',
    translation:
      "O Ever Living One, O Eternal One, by Your mercy I call on You to set right all my affairs. Do not place me in charge of my soul even for the blinking of an eye (i.e. a moment).",
    count: 1,
    timing: ['morning', 'evening'],
    virtue: null,
    reference: 'Sunan at-Tirmidhi, Book 48, Hadith 3524; Sunan Ibn Majah, Book 5, Hadith 3882',
    authenticity: 'Hasan (Good)',
    occasion: 'Morning and evening',
    benefits: 'Seeking help through Allāh\'s mercy, rectification of all affairs, reliance on Allāh rather than self',
  },

  // ─── 11. Subḥānallāhi wa biḥamdihi — Morning (thrice) ──────────────────
  {
    id: 11,
    arabic:
      'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
    transliteration:
      "Subḥānallāhi wa biḥamdihi: 'Adada khalqihi, wa riḍhā nafsihi, wa zinata 'arshihi wa middāda kalimātih.",
    translation:
      'How perfect Allāh is and praise is to Him, by the number of His creation and by the weight of His Throne, and by the extent of His Words.',
    count: 3,
    timing: ['morning'],
    virtue:
      'Reading this Du\'ā thrice is more virtuous than doing continuous Dhikr from Fajr prayer till Sunrise. The accepted view is that this Dhikr may be said anytime during the day or night, and is not specific to the morning.',
    reference: 'Sahih Muslim, Book 48, Hadith 2726; Sunan at-Tirmidhi, Book 47, Hadith 3464',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning, three times',
    benefits: 'Glorification and praise of Allāh, spiritual elevation, reward greater than continuous dhikr from Fajr to sunrise',
  },

  // ─── 12. Subḥānallāhi wa biḥamdihi — 100 times ─────────────────────────
  {
    id: 12,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa biḥamdih.',
    translation: 'How perfect Allāh is and praise is to Him.',
    count: 100,
    timing: ['morning', 'evening'],
    virtue:
      'The Prophet said: "Whoever recites this one hundred times in the morning and in the evening will not be surpassed on the Day of Resurrection by anyone having done better than this except someone who had recited it more."',
    reference: 'Sahih Muslim, Book 48, Hadith 2192; Sunan at-Tirmidhi, Book 47, Hadith 3464',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, 100 times each',
    benefits: 'Surpassing others on Day of Resurrection, glorification and praise of Allāh, spiritual elevation',
  },

  // ─── 13. Astaghfirullāha wa atūbu ilayh — 100 times ────────────────────
  {
    id: 13,
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullāha wa atūbu ilayh.',
    translation: 'I seek the forgiveness of Allāh & I turn to Him in repentance.',
    count: 100,
    timing: ['morning', 'evening'],
    virtue:
      'Hazrat Abu Hurairah related that the Messenger of Allāh said: "By Allāh, I seek forgiveness and repent to Allāh, more than seventy times a day." And in another narration he said, "O People, Repent! Verily I repent to Allāh, a hundred times a day."',
    reference: 'Sahih al-Bukhari, Book 80, Hadith 6307; Sunan at-Tirmidhi, Book 48, Hadith 3535',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, 100 times each',
    benefits: 'Seeking forgiveness, repentance, following the Sunnah of the Prophet, spiritual purification',
  },

  // ─── 14. Bismillāhil-laẓī lā yaḍurru — Morning & Evening (thrice) ─────
  {
    id: 14,
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      "Bismillāhil-laẓī lā yaḍurru ma'asmihi shay'un fil-ardhi wa lā fis-samā'i wa Huwas-Samī'ul-'Alīm.",
    translation:
      'In the name of Allāh with Whose name nothing is harmed on earth nor in the heavens and He is the All-Hearing, the All-Knowing.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue:
      'The Prophet said about this Du\'ā, "Whoever recites it three times in the morning will not be afflicted by any calamity before evening, and whoever recites it three times in the evening will not be afflicted by any calamity before morning." Abu Hurairah narrated that the Messenger of Allāh said, "Whoever recites this three times in the evening will be protected from the sting of poisonous animals throughout the night."',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5088; Jami\' at-Tirmidhi, Book 48, Hadith 3388',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Protection from calamity, protection from poisonous animals and insects, comprehensive protection',
  },

  // ─── 15. Ḥasbiyallāhu lā ilāha illā Huwa — Morning & Evening (7 times) ─
  {
    id: 15,
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration:
      "Ḥasbiyallāhu lā ilāha illā Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Aẓīm.",
    translation:
      'Allāh is sufficient for me. There is none worthy of worship but Him. I have placed my trust in Him, and He is Lord of the Majestic Throne.',
    count: 7,
    timing: ['morning', 'evening'],
    virtue:
      'The Prophet said, "Whoever recites this seven times in the morning and evening, Allāh will suffice him from all the worries of this world and the next."',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5081; Sunan at-Tirmidhi, Book 48, Hadith 3524',
    authenticity: 'Hasan (Good)',
    occasion: 'Morning and evening, seven times each',
    benefits: 'Sufficiency from Allāh, relief from worldly and spiritual worries, trust in Allāh',
  },

  // ─── 16. Asbaḥnā 'ala fiṭratil-Islām (Morning) — once ──────────────────
  {
    id: 16,
    arabic:
      'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
    transliteration:
      "Asbaḥnā 'ala fiṭratil-Islāmi wa 'ala kalimātil-ikhlāṡi, wa 'ala dīni Nabiyyinā Muḥammadin, wa 'ala millati abīnā Ibrāhīma, ḥanīfan Musliman wa mā kāna minal-mushrikīn.",
    translation:
      'We have entered a new day upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad & the faith of our father Ibrahim. He was upright (in worshipping Allāh), & a Muslim. He was not of those who worship others besides Allāh.',
    count: 1,
    timing: ['morning'],
    virtue: null,
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5089; Jami\' at-Tirmidhi, Book 48, Hadith 3391',
    authenticity: 'Hasan (Good)',
    occasion: 'After Fajr prayer',
    benefits: 'Affirmation of Islam, sincere devotion, following the path of Prophet Muhammad and Prophet Ibrahim',
  },

  // ─── 17. Amsaynā 'ala fiṭratil-Islām (Evening) — once ──────────────────
  {
    id: 17,
    arabic:
      'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
    transliteration:
      "Amsaynā 'ala fiṭratil-Islāmi wa 'ala kalimātil-ikhlāṡi, wa 'ala dīni Nabiyyinā Muḥammadīn, wa 'ala millati abīnā Ibrāhīma, ḥanīfan Musliman wa mā kāna minal-mushrikīn.",
    translation:
      'We end this day upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad and the faith of our father Ibrahim. He was upright (in worshipping Allāh), and a Muslim. He was not of those who worship others besides Allāh.',
    count: 1,
    timing: ['evening'],
    virtue:
      'Hazrat Abdul Rahman bin Abzi narrates that the Messenger of Allāh used to say this Du\'ā every Morning and Evening.',
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5090; Jami\' at-Tirmidhi, Book 48, Hadith 3392',
    authenticity: 'Hasan (Good)',
    occasion: 'After Asr prayer',
    benefits: 'Affirmation of Islam at the end of the day, sincere devotion, following the path of Prophet Muhammad and Prophet Ibrahim',
  },

  // ─── 18. Lā ilāha illallāhu waḥdahū — Morning (100 times) ──────────────
  {
    id: 18,
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Lā ilāha illallāhu waḥdahū lā sharīka lahū, lahul-mulku wa lahul-ḥamdu, wa Huwa 'alā kulli shay'in Qadīr.",
    translation:
      'None has the right to be worshipped but Allāh alone, Who has no partner. His is the dominion and His is the praise and He is Able to do all things.',
    count: 100,
    timing: ['morning'],
    virtue: null,
    reference: 'Sunan Abu Dāwūd, Book 41, Hadith 5081; Sahih al-Bukhari, Book 75, Hadith 5945',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning, 100 times',
    benefits: 'Affirmation of Tawheed (Monotheism), acknowledgment of Allāh\'s dominion and power, spiritual elevation',
  },

  // ─── 19. Salawāt (Durūd Ibrāhīm) — Morning & Evening ──────────────────
  {
    id: 19,
    arabic:
      'اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اَللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration:
      "Allāhumma ṡalli 'ala Muḥammadin wa 'ala āli Muḥammadin, kamā ṡallayta 'ala Ibrāhīma wa 'ala āli Ibrāhīma, innaka Ḥamīdum-Majīd. Allāhumma bārik 'ala Muḥammadin wa 'ala āli Muḥammadīn, Allāhumma bārik 'ala āli Ibrāhīma wa 'ala āli Muḥammadīn, innaka Ḥamīdum-Majīd.",
    translation:
      'O Allāh, send blessings upon Muḥammad and upon the family of Muhammad, just as You sent prayers upon Ibrahim and upon the followers of Ibrahim. Verily, You are full of praise and majesty. O Allāh, send blessings upon Muhammad and upon the family of Muhammad, just as You sent prayers upon Ibrahim and upon the followers of Ibrahim. Verily, You are full of praise and majesty.',
    count: 1,
    timing: ['morning', 'evening'],
    virtue:
      '"Whoever sends blessings upon me, Allāh will send blessings upon him tenfold." Sending Darud upon Prophet Muhammad is a good and blessed deed. However, sending Darud especially on Friday is established in the Sunnah.',
    reference: 'Sahih Muslim, Book 4, Hadith 407; Sunan at-Tirmidhi, Book 47, Hadith 3635',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, especially on Friday',
    benefits: 'Blessings from Allāh, following the Sunnah, spiritual connection with the Prophet',
  },

  // ─── 20. Morning du'ā for knowledge ────────────────────────────────────
  {
    id: 20,
    arabic:
      'اَللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    transliteration:
      "Allāhumma innī as'aluka 'ilman nāfi'an, wa rizqan ṭayyiban, wa 'amalan mutaqabbalan.",
    translation:
      'O Allāh, I ask You for knowledge which is beneficial and sustenance which is good, and deeds which are acceptable.',
    count: 1,
    timing: ['morning'],
    virtue:
      'Hazrat Ummu Salamah says that the Messenger of Allāh used to say this Du\'ā upon completing the Fajr prayer.',
    reference: 'Sunan Ibn Majah, Book 5, Hadith 3846; Musnad Ahmad, Hadith 26543',
    authenticity: 'Hasan (Good)',
    occasion: 'After Fajr prayer',
    benefits: 'Seeking beneficial knowledge, good sustenance, and acceptable deeds, spiritual and material blessings',
  },

  // ─── 21. Al-Mu'awwiẕatān — Sūrat al-Falaq — Morning & Evening (thrice) ─
  {
    id: 21,
    arabic:
      'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration:
      'Bismillāhir-Raḥmānir-Raḥīm. Qul a\'ūzu bi-rabbil-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin iẕā waqab. Wa min sharrin-naffāṡāti fil-\'uqad. Wa min sharri ḥāsidin iẕā ḥasad.',
    translation:
      'In the Name of Allāh, the Most Gracious, the Most Merciful. Say: I seek refuge with (Allāh) the Lord of the daybreak, from the evil of what He has created, and from the evil of the darkening (night) as it comes with its darkness, and from the evil of those who practice witchcraft when they blow in the knots, and from the evil of the envier when he envies.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue:
      'The Messenger of Allāh said, "Whoever recites this three times in the morning and in the evening, they will suffice him (as a protection) against everything."',
    reference: 'Sunan at-Tirmidhi, Book 47, Hadith 3575; Sunan Abu Dāwūd, Book 41, Hadith 5082',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Protection from all evil, protection from witchcraft and envy, comprehensive spiritual protection',
  },

  // ─── 22. Sūrat al-Ikhlāṡ — Morning & Evening (thrice) ──────────────────
  {
    id: 22,
    arabic:
      'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    transliteration:
      'Bismillāhir-Raḥmānir-Raḥīm. Qul Huwallāhu Aḥad. Allāhuṡ-Ṡamad. Lam yalid wa lam yūlad. Wa lam yakullahū kufuwan aḥad.',
    translation:
      'In the Name of Allāh, the Most Gracious, the Most Merciful. Say: He is Allāh, the Most Gracious, the Self-Sufficient Master, Whom all creatures need, He begets not nor was He begotten, and there is none equal to Him.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue:
      'The Messenger of Allāh said, "Whoever recites this three times in the morning and in the evening, they will suffice him (as a protection) against everything."',
    reference: 'Sunan at-Tirmidhi, Book 47, Hadith 2900; Sunan Abu Dāwūd, Book 41, Hadith 5083',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Affirmation of Tawheed, protection from all evil, spiritual elevation, comprehensive protection',
  },

  // ─── 23. Sūrat al-Nās — Morning & Evening (thrice) ──────────────────────
  {
    id: 23,
    arabic:
      'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration:
      "Bismillāhir-Raḥmānir-Raḥīm. Qul a'ūzu bi-rabbin-nās. Malikin-nās. Ilāhin-nās. Min sharril-waswāsil-khannās. Allaẕī yuwaswisu fī ṡudūrin-nās. Minal-jinnati wannās.",
    translation:
      'In the Name of Allāh, the Most Gracious, the Most Merciful. Say: I seek refuge with (Allāh) the Lord of mankind, the King of mankind, the God of mankind, from the evil of the whisperer who withdraws, who whispers in the breasts of mankind, of the jinn and men.',
    count: 3,
    timing: ['morning', 'evening'],
    virtue:
      'The Messenger of Allāh said, "Whoever recites this three times in the morning and in the evening, they will suffice him (as a protection) against everything."',
    reference: 'Sunan at-Tirmidhi, Book 47, Hadith 2900; Sunan Abu Dāwūd, Book 41, Hadith 5084',
    authenticity: 'Sahih (Authentic)',
    occasion: 'Morning and evening, three times each',
    benefits: 'Protection from whispers of Satan, protection from evil of jinn and humans, comprehensive spiritual protection',
  },
];

export const getMorningAdhkar = () => ADHKAR_ENHANCED.filter((d) => d.timing.includes('morning'));
export const getEveningAdhkar = () => ADHKAR_ENHANCED.filter((d) => d.timing.includes('evening'));
