const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  flat: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: false },
  preference: { type: String, required: false },
  date: { type: String, required: true }, // YYYY-MM-DD
  slotLabel: { type: String, required: true }, // e.g. "1:00 PM - 2:00 PM"
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

// A given date+slot combination can only be booked once (while confirmed)
bookingSchema.index({ date: 1, slotLabel: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
