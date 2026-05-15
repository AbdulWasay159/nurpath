const express = require('express');
const { body } = require('express-validator');
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required.'),
  body('date').isISO8601().withMessage('Valid date is required.'),
  body('time').notEmpty().withMessage('Time is required.'),
  body('masjid').trim().notEmpty().withMessage('Masjid name is required.'),
];

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, adminOnly, eventValidation, createEvent);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
