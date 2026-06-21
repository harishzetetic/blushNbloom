require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const Slot = require('./models/Slot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
}));

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Seed default slots if none exist
    const count = await Slot.countDocuments();
    if (count === 0) {
      await Slot.insertMany([
        { label: '10:00 AM - 11:00 AM', startTime: '10:00' },
        { label: '1:00 PM - 2:00 PM', startTime: '13:00' },
        { label: '3:00 PM - 4:00 PM', startTime: '15:00' }
      ]);
      console.log('Default slots seeded');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
