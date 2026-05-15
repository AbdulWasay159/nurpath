const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();
router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
module.exports = router;
