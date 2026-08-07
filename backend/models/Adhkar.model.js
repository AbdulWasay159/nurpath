const mongoose = require('mongoose');

const AdhkarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  arabic: { type: String, required: true },
  transliteration: { type: String, required: true },
  translation: { type: String, required: true },
  reference: { type: String, required: true }, // e.g. "Sahih Muslim 597"
  authenticity: { type: String, enum: ['Sahih', 'Hasan'], default: 'Sahih' },
  category: { 
    type: String, 
    enum: ['Morning', 'Evening', 'After Salah', 'Before Sleep', 'General'],
    required: true,
    index: true
  },
  repetitions: { type: Number, default: 1 },
  benefit: { type: String, default: '' },
  verifiedByAdmin: { type: Boolean, default: true }
});

module.exports = mongoose.models.Adhkar || mongoose.model('Adhkar', AdhkarSchema);
