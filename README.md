# Blush & Bloom By Vishakha — Booking Web App

Mobile-first booking site + admin panel for B&B beauty studio (B-601, Nilaya Greens, Raj Nagar Extension).

## What's included
- `server.js` — Express server
- `models/` — MongoDB schemas (Booking, Slot, Content)
- `routes/api.js` — public APIs (availability, booking, content)
- `routes/admin.js` — admin APIs (login, manage bookings/slots/content)
- `config/mailer.js` — sends confirmation emails via Nodemailer
- `public/` — the landing page (black theme, mobile-first)
- `admin/` — the admin panel (`/admin`)

## Setup

1. **Install dependencies**
   ```
   cd bnb-app
   npm install
   ```

2. **Create your `.env` file**
   Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI`: get a free MongoDB Atlas cluster at mongodb.com/atlas, or run MongoDB locally.
   - `EMAIL_USER` / `EMAIL_PASS`: use a Gmail address + an **App Password** (not your normal password). Generate one at myaccount.google.com → Security → App Passwords. Requires 2-Step Verification enabled on the Gmail account.
   - `STUDIO_EMAIL`: where booking notifications for Vishakha should land.
   - `SESSION_SECRET`: any random long string.

3. **Add a hero image**
   Put a photo at `public/img/hero.jpg` (studio photo, mehndi/nail art closeup, etc.) — or update the URL from the admin panel later.

4. **Run it**
   ```
   npm start
   ```
   Visit `http://localhost:3000` for the landing page, `http://localhost:3000/admin` for the admin panel.

5. **Admin login**
   - Username: `9711195889`
   - Password: `Summer@2026`
   (Stored in `.env` — change these before going live, and definitely before sharing this codebase with anyone.)

## How booking works
- Default slots seeded automatically on first run: 10:00–11:00 AM, 1:00–2:00 PM, 3:00–4:00 PM.
- Customer picks a date (today + next 6 days), then a slot, then fills name/flat/email/mobile(optional)/preference.
- Booking is rejected if the slot was taken in the meantime (handles two people booking simultaneously).
- On success: confirmation email sent to customer + to `STUDIO_EMAIL`.

## What admin can do
- **Bookings tab**: see all bookings, cancel any (frees the slot back up).
- **Time Slots tab**: add new slot templates (e.g. 5–6 PM once she's busier), disable/delete existing ones.
- **Landing Page tab**: edit hero title/subtitle/image, contact phone/address/email. (Services and testimonials are currently edited directly in the database — see "Known limitations" below.)

## Known limitations / things to fix before real launch
1. **Admin credentials are plaintext in `.env`.** Fine for personal use behind a private URL, not fine if this gets deployed publicly without further hardening (rate limiting on login, HTTPS-only cookies, etc.).
2. **Services and testimonials aren't editable from the admin UI yet** — only hero/contact fields are. To change them today, edit the `Content` document directly in MongoDB (or ask for the admin form to be extended — straightforward to add).
3. **Feedback form on the landing page doesn't save anywhere yet** — it just shows a "thank you" message. If you want feedback stored/emailed, that's a small addition.
4. **No SMS/WhatsApp notifications** — only email. Given your audience, this is the most likely gap to bite you first.
5. **No image upload for hero photo** — admin panel takes a URL/path, not a file upload. You'd host the image yourself or extend this later.
6. **Booking has no cancellation flow for the customer** — only admin can cancel. If a customer needs to cancel, they'd have to contact you directly.

## Deployment
Any Node host works (Render, Railway, a VPS). Make sure to:
- Set all `.env` variables as environment variables on the host.
- Use MongoDB Atlas (not localhost) for the database.
- Set `cookie.secure: true` in `server.js`'s session config once you're on HTTPS.
