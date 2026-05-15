const express = require('express');
const { getMasjids, getMasjid, createMasjid, updateMasjid, deleteMasjid } = require('../controllers/masjid.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/',     getMasjids);
router.get('/:id',  getMasjid);
router.post('/',    protect, adminOnly, createMasjid);
router.put('/:id',  protect, adminOnly, updateMasjid);
router.delete('/:id', protect, adminOnly, deleteMasjid);

module.exports = router;
