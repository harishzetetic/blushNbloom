const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Content = require('../models/Content');
const { sendBookingEmails } = require('../config/mailer');

// GET landing page content
router.get('/content', async (req, res) => {
  try {
    let content = await Content.findOne({ key: 'main' });
    if (!content) {
      content = await Content.create({ key: 'main' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// GET available slots for a given date (YYYY-MM-DD)
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date is within next 7 days (including today)
    const requested = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    if (requested < today || requested > maxDate) {
      return res.status(400).json({ error: 'Date out of allowed booking range' });
    }

    const allSlots = await Slot.find({ active: true }).sort({ startTime: 1 });
    const existingBookings = await Booking.find({ date, status: 'confirmed' });
    const bookedLabels = existingBookings.map(b => b.slotLabel);

    const result = allSlots.map(slot => ({
      label: slot.label,
      startTime: slot.startTime,
      available: !bookedLabels.includes(slot.label)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// POST create a booking
router.post('/book', async (req, res) => {
  try {
    const { name, flat, email, mobile, preference, date, slotLabel } = req.body;

    if (!name || !flat || !email || !date || !slotLabel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Re-check slot is still free (race condition guard)
    const existing = await Booking.findOne({ date, slotLabel, status: 'confirmed' });
    if (existing) {
      return res.status(409).json({ error: 'This slot was just booked by someone else. Please pick another.' });
    }

    const booking = await Booking.create({ name, flat, email, mobile, preference, date, slotLabel });

    // Send confirmation emails (don't block booking success on email failure)
    try {
      await sendBookingEmails(booking);
    } catch (mailErr) {
      console.error('Email send failed:', mailErr.message);
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
});

module.exports = router;
