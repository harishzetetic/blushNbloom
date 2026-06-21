const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'main' },
  heroTitle: { type: String, default: 'Blush & Bloom By Vishakha' },
  heroSubtitle: { type: String, default: 'Mehndi Art • Nail Art • Makeup • Threading • Waxing' },
  heroImage: { type: String, default: '/img/hero.jpg' },
  services: [{
    title: String,
    description: String,
    icon: String
  }],
  testimonials: [{
    name: String,
    text: String,
    rating: Number
  }],
  contactPhone: { type: String, default: '+91-9711195889' },
  contactAddress: { type: String, default: 'B-601, Nilaya Greens, Raj Nagar Extension, Ghaziabad' },
  contactEmail: { type: String, default: '' },
  instagram: { type: String, default: '' }
});

module.exports = mongoose.model('Content', contentSchema);
