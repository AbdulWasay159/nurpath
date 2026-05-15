const Masjid = require('../models/Masjid.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/masjids — public
const getMasjids = asyncHandler(async (req, res) => {
  const masjids = await Masjid.find({ isActive: true })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: masjids.length, data: masjids });
});

// GET /api/masjids/:id — public
const getMasjid = asyncHandler(async (req, res) => {
  const masjid = await Masjid.findById(req.params.id).populate('createdBy', 'name');
  if (!masjid || !masjid.isActive) {
    return res.status(404).json({ success: false, message: 'Masjid not found.' });
  }
  res.json({ success: true, data: masjid });
});

// POST /api/masjids — admin only
const createMasjid = asyncHandler(async (req, res) => {
  const masjid = await Masjid.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Masjid created.', data: masjid });
});

// PUT /api/masjids/:id — admin only
const updateMasjid = asyncHandler(async (req, res) => {
  const masjid = await Masjid.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!masjid) return res.status(404).json({ success: false, message: 'Masjid not found.' });
  res.json({ success: true, message: 'Masjid updated.', data: masjid });
});

// DELETE /api/masjids/:id — admin only (soft delete)
const deleteMasjid = asyncHandler(async (req, res) => {
  const masjid = await Masjid.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!masjid) return res.status(404).json({ success: false, message: 'Masjid not found.' });
  res.json({ success: true, message: 'Masjid removed.' });
});

module.exports = { getMasjids, getMasjid, createMasjid, updateMasjid, deleteMasjid };
