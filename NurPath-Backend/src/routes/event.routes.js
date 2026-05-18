const express = require('express');
const { body } = require('express-validator');
const {
  getEvents, getEvent, createEvent, updateEvent,
  deleteEvent, toggleAttendance, getMyAttendance,
} = require('../controllers/event.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required.'),
  body('date').isISO8601().withMessage('Valid date required.'),
  body('time').notEmpty().withMessage('Time is required.'),
  body('masjid').trim().notEmpty().withMessage('Masjid name is required.'),
];

// Public (but attach user if logged in via optional protect)
router.get('/',    protect, getEvents);
router.get('/my-attendance', protect, getMyAttendance);
router.get('/:id', protect, getEvent);

// Auth users
router.put('/:id/attend', protect, toggleAttendance);

// Admin only
router.post('/',    protect, adminOnly, eventValidation, createEvent);
router.put('/:id',  protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
