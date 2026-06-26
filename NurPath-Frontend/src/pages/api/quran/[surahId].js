// pages/api/quran/[surahId].js
// Server-side proxy → fetches Arabic + English translation in one call

export default async function handler(req, res) {
  const { surahId } = req.query;
  const id = parseInt(surahId);

  if (!id || id < 1 || id > 114) {
    return res.status(400).json({ error: 'Invalid surah number (must be 1–114)' });
  }

  try {
    // Fetch Arabic (Uthmani) + Sahih International translation in one request
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.sahih`
    );
    const data = await response.json();

    if (data.status !== 'OK' || !data.data || data.data.length < 2) {
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const arabicEdition  = data.data[0]; // quran-uthmani
    const englishEdition = data.data[1]; // en.sahih

    // Merge into a single verses array: { number, arabic, translation }
    const verses = arabicEdition.ayahs.map((ayah, i) => ({
      number:      ayah.numberInSurah,
      arabic:      ayah.text,
      translation: englishEdition.ayahs[i]?.text || '',
    }));

    const chapter = {
      id:               arabicEdition.number,
      name:             arabicEdition.englishName,
      arabicName:       arabicEdition.name,
      meaning:          arabicEdition.englishNameTranslation,
      versesCount:      arabicEdition.numberOfAyahs,
      revelationType:   arabicEdition.revelationType, // 'Meccan' | 'Medinan'
    };

    // Cache for 24 hours — Quran text never changes
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({ chapter, verses });
  } catch (err) {
    console.error(`Quran surah ${id} proxy error:`, err);
    return res.status(502).json({ error: 'Failed to fetch surah' });
  }
}
