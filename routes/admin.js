const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Content = require('../models/Content');

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

// POST admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- Bookings ---
router.get('/bookings', requireAdmin, async (req, res) => {
  const bookings = await Booking.find().sort({ date: 1, createdAt: -1 });
  res.json(bookings);
});

router.post('/bookings/:id/cancel', requireAdmin, async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
  res.json({ success: true, booking });
});

// --- Slots ---
router.get('/slots', requireAdmin, async (req, res) => {
  const slots = await Slot.find().sort({ startTime: 1 });
  res.json(slots);
});

router.post('/slots', requireAdmin, async (req, res) => {
  const { label, startTime } = req.body;
  if (!label || !startTime) return res.status(400).json({ error: 'label and startTime required' });
  const slot = await Slot.create({ label, startTime });
  res.json(slot);
});

router.put('/slots/:id', requireAdmin, async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(slot);
});

router.delete('/slots/:id', requireAdmin, async (req, res) => {
  await Slot.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Content ---
router.get('/content', requireAdmin, async (req, res) => {
  let content = await Content.findOne({ key: 'main' });
  if (!content) content = await Content.create({ key: 'main' });
  res.json(content);
});

router.put('/content', requireAdmin, async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { key: 'main' },
    { ...req.body, key: 'main' },
    { new: true, upsert: true }
  );
  res.json(content);
});

module.exports = router;
