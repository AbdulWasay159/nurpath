// pages/api/quran/chapters.js
// Server-side proxy → api.alquran.cloud (no CORS issues)

export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(502).json({ error: 'Upstream API error' });
    }

    // Cache for 24 hours — surah list never changes
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({ chapters: data.data });
  } catch (err) {
    console.error('Quran chapters proxy error:', err);
    return res.status(502).json({ error: 'Failed to fetch surah list' });
  }
}
