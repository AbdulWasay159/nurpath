const express = require('express');
const {
  getAdhkar,
  getSingleAdhkar,
  createAdhkar,
  updateAdhkar,
  deleteAdhkar,
} = require('../controllers/adhkar.controller');

const router = express.Router();

// ── Auth middleware (need to import from existing middleware) ──
const { protect, adminOnly } = require('../middleware/auth.middleware');

router
  .route('/')
  .get(getAdhkar)
  .post(protect, adminOnly, createAdhkar);

router
  .route('/:id')
  .get(getSingleAdhkar)
  .put(protect, adminOnly, updateAdhkar)
  .delete(protect, adminOnly, deleteAdhkar);

module.exports = router;
