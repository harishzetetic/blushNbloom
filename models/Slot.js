const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true }, // "1:00 PM - 2:00 PM"
  startTime: { type: String, required: true }, // "13:00" 24hr for sorting
  active: { type: Boolean, default: true } // admin can turn a slot template off entirely
});

module.exports = mongoose.model('Slot', slotSchema);
