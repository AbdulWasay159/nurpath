const Event = require('../models/Event.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

// GET /api/events
const getEvents = asyncHandler(async (req, res) => {
  const { search, category, upcoming } = req.query;
  const filter = { isActive: true };

  if (upcoming === 'true') filter.date = { $gte: new Date() };
  if (category && category !== 'all') filter.category = category;
  if (search) {
    filter.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { masjid:  { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } },
      { topic:   { $regex: search, $options: 'i' } },
    ];
  }

  const userId = req.user?._id;

  const events = await Event.find(filter)
    .populate('createdBy', 'name')
    .sort({ date: 1 });

  // Attach userAttendance field for authenticated users
  const data = events.map((e) => {
    const obj = e.toObject();
    if (userId) {
      const att = e.attendees.find((a) => a.user.toString() === userId.toString());
      obj.userAttendance = att ? att.status : null;
    }
    return obj;
  });

  res.json({ success: true, count: data.length, data });
});

// GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name');
  if (!event || !event.isActive) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  const obj = event.toObject();
  if (req.user) {
    const att = event.attendees.find((a) => a.user.toString() === req.user._id.toString());
    obj.userAttendance = att ? att.status : null;
  }
  res.json({ success: true, data: obj });
});

// POST /api/events — admin only
const createEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Event created successfully.', data: event });
});

// PUT /api/events/:id — admin only
const updateEvent = asyncHandler(async (req, res) => {
  // Prevent overwriting attendees via this route
  delete req.body.attendees;
  delete req.body.attendingCount;

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, message: 'Event updated.', data: event });
});

// DELETE /api/events/:id — admin only (soft delete)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, message: 'Event deleted.' });
});

// PUT /api/events/:id/attend — authenticated users
const toggleAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'attending' | 'not_attending'
  if (!['attending', 'not_attending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be attending or not_attending.' });
  }

  const event = await Event.findById(req.params.id);
  if (!event || !event.isActive) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const idx = event.attendees.findIndex((a) => a.user.toString() === req.user._id.toString());
  if (idx === -1) {
    event.attendees.push({ user: req.user._id, status, markedAt: new Date() });
  } else {
    event.attendees[idx].status = status;
    event.attendees[idx].markedAt = new Date();
  }

  await event.save();
  res.json({ success: true, message: `Attendance marked as ${status}.`, userAttendance: status, attendingCount: event.attendingCount });
});

// GET /api/events/my-attendance — authenticated user's event stats
const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const events = await Event.find({ isActive: true });

  let attended = 0, notAttending = 0, upcoming = 0;
  const attendedEvents = [], upcomingEvents = [];

  events.forEach((e) => {
    const att = e.attendees.find((a) => a.user.toString() === userId.toString());
    const isPast = e.date < now;

    if (att?.status === 'attending') {
      attended++;
      if (isPast) attendedEvents.push({ _id: e._id, title: e.title, date: e.date, masjid: e.masjid });
    }
    if (att?.status === 'not_attending') notAttending++;
    if (!isPast && att?.status === 'attending') {
      upcoming++;
      upcomingEvents.push({ _id: e._id, title: e.title, date: e.date, masjid: e.masjid });
    }
  });

  const totalResponded = attended + notAttending;
  const attendancePct = totalResponded > 0 ? Math.round((attended / totalResponded) * 100) : 0;

  res.json({
    success: true,
    data: {
      attended,
      notAttending,
      upcoming,
      attendancePct,
      attendedEvents,
      upcomingEvents,
    },
  });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, toggleAttendance, getMyAttendance };
