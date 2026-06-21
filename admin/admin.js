async function checkAuth() {
  const res = await fetch('/api/admin/check');
  const data = await res.json();
  if (data.isAdmin) {
    showDashboard();
  }
}
checkAuth();

async function login() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Login failed';
      return;
    }
    showDashboard();
  } catch (err) {
    errEl.textContent = 'Network error.';
  }
}

async function logout() {
  await fetch('/api/admin/logout', { method: 'POST' });
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  loadBookings();
  loadSlots();
  loadContent();
}

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------- Bookings ----------
async function loadBookings() {
  const res = await fetch('/api/admin/bookings');
  const bookings = await res.json();
  const list = document.getElementById('bookingsList');
  list.innerHTML = '';
  if (!bookings.length) {
    list.innerHTML = '<p style="color:#999;">No bookings yet.</p>';
    return;
  }
  bookings.forEach(b => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="info">
        <b>${b.name}</b> (Flat ${b.flat})<br>
        ${b.date} | ${b.slotLabel}<br>
        ${b.email} ${b.mobile ? '| ' + b.mobile : ''}<br>
        ${b.preference ? '<i>' + b.preference + '</i><br>' : ''}
        <span class="badge ${b.status}">${b.status}</span>
      </div>
      ${b.status === 'confirmed' ? `<button onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
    `;
    list.appendChild(item);
  });
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking? The slot will become available again.')) return;
  await fetch(`/api/admin/bookings/${id}/cancel`, { method: 'POST' });
  loadBookings();
}

// ---------- Slots ----------
async function loadSlots() {
  const res = await fetch('/api/admin/slots');
  const slots = await res.json();
  const list = document.getElementById('slotsList');
  list.innerHTML = '';
  slots.forEach(s => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="info">${s.label} ${s.active ? '' : '(inactive)'}</div>
      <button onclick="toggleSlot('${s._id}', ${!s.active})">${s.active ? 'Disable' : 'Enable'}</button>
      <button onclick="deleteSlot('${s._id}')">Delete</button>
    `;
    list.appendChild(item);
  });
}

async function addSlot() {
  const label = document.getElementById('newSlotLabel').value.trim();
  const startTime = document.getElementById('newSlotTime').value.trim();
  if (!label || !startTime) return alert('Please fill both fields');
  await fetch('/api/admin/slots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, startTime })
  });
  document.getElementById('newSlotLabel').value = '';
  document.getElementById('newSlotTime').value = '';
  loadSlots();
}

async function toggleSlot(id, newActive) {
  await fetch(`/api/admin/slots/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: newActive })
  });
  loadSlots();
}

async function deleteSlot(id) {
  if (!confirm('Delete this slot permanently?')) return;
  await fetch(`/api/admin/slots/${id}`, { method: 'DELETE' });
  loadSlots();
}

// ---------- Content ----------
async function loadContent() {
  const res = await fetch('/api/admin/content');
  const c = await res.json();
  document.getElementById('c_heroTitle').value = c.heroTitle || '';
  document.getElementById('c_heroSubtitle').value = c.heroSubtitle || '';
  document.getElementById('c_heroImage').value = c.heroImage || '';
  document.getElementById('c_contactPhone').value = c.contactPhone || '';
  document.getElementById('c_contactAddress').value = c.contactAddress || '';
  document.getElementById('c_contactEmail').value = c.contactEmail || '';
}

async function saveContent() {
  const payload = {
    heroTitle: document.getElementById('c_heroTitle').value,
    heroSubtitle: document.getElementById('c_heroSubtitle').value,
    heroImage: document.getElementById('c_heroImage').value,
    contactPhone: document.getElementById('c_contactPhone').value,
    contactAddress: document.getElementById('c_contactAddress').value,
    contactEmail: document.getElementById('c_contactEmail').value
  };
  await fetch('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const msg = document.getElementById('contentSaveMsg');
  msg.textContent = 'Saved!';
  setTimeout(() => msg.textContent = '', 2000);
}
