document.getElementById('year').textContent = new Date().getFullYear();

let selectedDate = null;
let selectedSlot = null;

// ---------- Load content from backend ----------
async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const c = await res.json();

    document.getElementById('heroTitle').textContent = c.heroTitle;
    document.getElementById('heroSubtitle').textContent = c.heroSubtitle;
    if (c.heroImage) document.getElementById('heroImg').src = c.heroImage;

    document.getElementById('contactAddress').textContent = c.contactAddress;
    document.getElementById('contactPhone').textContent = '📞 ' + c.contactPhone;
    if (c.contactEmail) document.getElementById('contactEmail').textContent = '✉️ ' + c.contactEmail;

    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';
    const services = (c.services && c.services.length) ? c.services : [
      { icon: '🎨', title: 'Mehndi Art', description: 'Traditional & bridal mehndi designs' },
      { icon: '💅', title: 'Nail Art', description: 'Creative nail art & extensions' },
      { icon: '💄', title: 'Makeup', description: 'Party & occasion makeup' },
      { icon: '✨', title: 'Threading', description: 'Eyebrow & facial threading' },
      { icon: '🧖', title: 'Bleach & Wax', description: 'Skin care & hair removal' },
      { icon: '💇', title: 'Hair Styling', description: 'Styling for every occasion' }
    ];
    services.forEach(s => {
      grid.innerHTML += `
        <div class="service-card">
          <div class="icon">${s.icon || '✨'}</div>
          <h3>${s.title}</h3>
          <p>${s.description}</p>
        </div>`;
    });

    const track = document.getElementById('testimonialTrack');
    track.innerHTML = '';
    const testimonials = (c.testimonials && c.testimonials.length) ? c.testimonials : [
      { name: 'Priya S.', text: 'Amazing mehndi work, very patient and detailed!', rating: 5 },
      { name: 'Anjali R.', text: 'Loved the nail art, will definitely come back.', rating: 5 }
    ];
    testimonials.forEach(t => {
      track.innerHTML += `
        <div class="testimonial-card">
          <div class="stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="text">"${t.text}"</p>
          <p class="name">- ${t.name}</p>
        </div>`;
    });
  } catch (err) {
    console.error('Failed to load content', err);
  }
}
loadContent();

// ---------- Booking Modal ----------
function openBooking() {
  document.getElementById('bookingModal').classList.add('active');
  selectedDate = null;
  selectedSlot = null;
  document.getElementById('stepDate').style.display = 'block';
  document.getElementById('stepSlot').style.display = 'none';
  document.getElementById('stepForm').style.display = 'none';
  document.getElementById('stepSuccess').style.display = 'none';
  document.getElementById('modalError').textContent = '';
  buildDatePicker();
}
function closeBooking() {
  document.getElementById('bookingModal').classList.remove('active');
}

function buildDatePicker() {
  const picker = document.getElementById('datePicker');
  picker.innerHTML = '';
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const chip = document.createElement('div');
    chip.className = 'date-chip';
    chip.innerHTML = `<div>${dayName}</div><div class="day">${dayNum}</div>`;
    chip.onclick = () => selectDate(iso, chip);
    picker.appendChild(chip);
  }
}

function selectDate(iso, chipEl) {
  selectedDate = iso;
  document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
  chipEl.classList.add('selected');
  document.getElementById('stepSlot').style.display = 'block';
  document.getElementById('stepForm').style.display = 'none';
  loadSlots(iso);
}

async function loadSlots(date) {
  const slotPicker = document.getElementById('slotPicker');
  slotPicker.innerHTML = 'Loading slots...';
  try {
    const res = await fetch(`/api/availability/${date}`);
    const slots = await res.json();
    slotPicker.innerHTML = '';
    if (!slots.length) {
      slotPicker.innerHTML = '<p style="color:#999;">No slots configured.</p>';
      return;
    }
    slots.forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'slot-chip' + (s.available ? '' : ' disabled');
      chip.innerHTML = `<span>${s.label}</span><span>${s.available ? '' : 'Booked'}</span>`;
      if (s.available) {
        chip.onclick = () => selectSlot(s.label, chip);
      }
      slotPicker.appendChild(chip);
    });
  } catch (err) {
    slotPicker.innerHTML = '<p style="color:#ff6b6b;">Failed to load slots.</p>';
  }
}

function selectSlot(label, chipEl) {
  selectedSlot = label;
  document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
  chipEl.classList.add('selected');
  document.getElementById('stepForm').style.display = 'block';
  document.getElementById('selectedSummary').textContent = `Selected: ${selectedDate} | ${selectedSlot}`;
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('modalError');
  errorEl.textContent = '';

  if (!selectedDate || !selectedSlot) {
    errorEl.textContent = 'Please select a date and time slot.';
    return;
  }

  const payload = {
    name: document.getElementById('bf_name').value.trim(),
    flat: document.getElementById('bf_flat').value.trim(),
    email: document.getElementById('bf_email').value.trim(),
    mobile: document.getElementById('bf_mobile').value.trim(),
    preference: document.getElementById('bf_pref').value.trim(),
    date: selectedDate,
    slotLabel: selectedSlot
  };

  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'Booking failed.';
      return;
    }
    document.getElementById('stepDate').style.display = 'none';
    document.getElementById('stepSlot').style.display = 'none';
    document.getElementById('stepForm').style.display = 'none';
    document.getElementById('stepSuccess').style.display = 'block';
  } catch (err) {
    errorEl.textContent = 'Something went wrong. Please try again.';
  }
});

// ---------- Feedback form (stored client-side notice only, no backend persistence yet) ----------
document.getElementById('feedbackForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('feedbackNote').textContent = 'Thank you for your feedback!';
  e.target.reset();
});
