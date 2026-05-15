const Event = require('../models/Event.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

// GET /api/events — public: upcoming events
const getEvents = asyncHandler(async (req, res) => {
  const { search, category, upcoming } = req.query;
  const filter = { isActive: true };

  if (upcoming === 'true') filter.date = { $gte: new Date() };
  if (category && category !== 'all') filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { masjid: { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
    ];
  }

  const events = await Event.find(filter)
    .populate('createdBy', 'name')
    .sort({ date: 1 });

  res.json({ success: true, count: events.length, data: events });
});

// GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name');
  if (!event || !event.isActive) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  res.json({ success: true, data: event });
});

// POST /api/events — admin only
const createEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Event created.', data: event });
});

// PUT /api/events/:id — admin only
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, message: 'Event updated.', data: event });
});

// DELETE /api/events/:id — admin only (soft delete)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, message: 'Event deleted.' });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
