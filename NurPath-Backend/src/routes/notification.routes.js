// notification.routes.js
const express = require('express');
const { getNotifications, markRead, markAllRead, createNotification } = require('../controllers/notification.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const router = express.Router();
router.use(protect);
router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.post('/', adminOnly, createNotification);
module.exports = router;
