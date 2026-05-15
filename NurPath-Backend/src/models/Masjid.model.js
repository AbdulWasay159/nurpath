const mongoose = require('mongoose');

const timingsSchema = new mongoose.Schema({
  fajr:    { type: String, default: '' },
  dhuhr:   { type: String, default: '' },
  asr:     { type: String, default: '' },
  maghrib: { type: String, default: '' },
  isha:    { type: String, default: '' },
}, { _id: false });

const masjidSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Masjid name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    timings: {
      type: timingsSchema,
      default: () => ({}),
    },
    jumuahTime: {
      type: String,
      default: '',
    },
    jumuahKhatib: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Masjid', masjidSchema);
