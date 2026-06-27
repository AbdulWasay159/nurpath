// pages/api/quran/[surahId].js
// Server-side proxy → fetches Arabic + one or more translations from alquran.cloud

// Available translation edition identifiers on alquran.cloud
// We support a curated set; the client passes a comma-separated list via ?translations=
const VALID_EDITIONS = new Set([
  'en.sahih',       // Sahih International (English)
  'en.pickthall',   // Pickthall (English)
  'en.yusufali',    // Yusuf Ali (English)
  'ur.jalandhry',   // Jalandhry (Urdu)
  'ur.ahmedali',    // Ahmed Ali (Urdu)
  'fr.hamidullah',  // Hamidullah (French)
  'tr.diyanet',     // Diyanet (Turkish)
  'de.aburida',     // Abu Rida (German)
  'id.indonesian',  // Indonesian
  'bn.bengali',     // Bengali
  'es.asad',        // Muhammad Asad (Spanish)
  'ru.kuliev',      // Kuliev (Russian)
]);

const DEFAULT_TRANSLATIONS = 'en.sahih';

export default async function handler(req, res) {
  const { surahId, translations } = req.query;
  const id = parseInt(surahId);

  if (!id || id < 1 || id > 114) {
    return res.status(400).json({ error: 'Invalid surah number (must be 1–114)' });
  }

  // Parse and validate requested translations
  const requestedEditions = (translations || DEFAULT_TRANSLATIONS)
    .split(',')
    .map((e) => e.trim())
    .filter((e) => VALID_EDITIONS.has(e))
    .slice(0, 4); // max 4 translations at once

  if (requestedEditions.length === 0) {
    requestedEditions.push(DEFAULT_TRANSLATIONS);
  }

  // Always fetch Arabic uthmani + requested translation editions
  const editionsList = ['quran-uthmani', ...requestedEditions].join(',');

  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${id}/editions/${editionsList}`
    );
    const data = await response.json();

    if (data.status !== 'OK' || !data.data || data.data.length < 2) {
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const arabicEdition = data.data[0]; // quran-uthmani is always first
    const translationEditions = data.data.slice(1); // one per requested edition

    // Merge: each verse gets arabic + translations object keyed by edition
    const verses = arabicEdition.ayahs.map((ayah, i) => {
      const translationMap = {};
      translationEditions.forEach((edition, ei) => {
        translationMap[requestedEditions[ei]] = edition.ayahs[i]?.text || '';
      });
      return {
        number:       ayah.numberInSurah,
        arabic:       ayah.text,
        translations: translationMap,
        // Legacy field — keep for any code that still reads .translation
        translation:  translationEditions[0]?.ayahs[i]?.text || '',
      };
    });

    const chapter = {
      id:             arabicEdition.number,
      name:           arabicEdition.englishName,
      arabicName:     arabicEdition.name,
      meaning:        arabicEdition.englishNameTranslation,
      versesCount:    arabicEdition.numberOfAyahs,
      revelationType: arabicEdition.revelationType,
    };

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({ chapter, verses, activeEditions: requestedEditions });
  } catch (err) {
    console.error(`Quran surah ${id} proxy error:`, err);
    return res.status(502).json({ error: 'Failed to fetch surah' });
  }
}
