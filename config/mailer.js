const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendBookingEmails(booking) {
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#d4af37;">Booking Confirmed - Blush & Bloom By Vishakha</h2>
      <p>Hi ${booking.name},</p>
      <p>Your appointment is confirmed. Here are the details:</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:6px 0;"><b>Date</b></td><td>${booking.date}</td></tr>
        <tr><td style="padding:6px 0;"><b>Time Slot</b></td><td>${booking.slotLabel}</td></tr>
        <tr><td style="padding:6px 0;"><b>Flat No.</b></td><td>${booking.flat}</td></tr>
        <tr><td style="padding:6px 0;"><b>Preference/Notes</b></td><td>${booking.preference || '-'}</td></tr>
      </table>
      <p style="margin-top:20px;">Location: B-601, Nilaya Greens, Raj Nagar Extension, Ghaziabad</p>
      <p>See you soon! - Vishakha</p>
    </div>
  `;

  const studioHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#d4af37;">New Booking Received</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:6px 0;"><b>Name</b></td><td>${booking.name}</td></tr>
        <tr><td style="padding:6px 0;"><b>Flat No.</b></td><td>${booking.flat}</td></tr>
        <tr><td style="padding:6px 0;"><b>Email</b></td><td>${booking.email}</td></tr>
        <tr><td style="padding:6px 0;"><b>Mobile</b></td><td>${booking.mobile || '-'}</td></tr>
        <tr><td style="padding:6px 0;"><b>Date</b></td><td>${booking.date}</td></tr>
        <tr><td style="padding:6px 0;"><b>Time Slot</b></td><td>${booking.slotLabel}</td></tr>
        <tr><td style="padding:6px 0;"><b>Preference/Notes</b></td><td>${booking.preference || '-'}</td></tr>
      </table>
    </div>
  `;

  const mailPromises = [
    transporter.sendMail({
      from: `"Blush & Bloom By Vishakha" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: 'Your Appointment is Confirmed - Blush & Bloom',
      html: customerHtml
    }),
    transporter.sendMail({
      from: `"B&B Booking System" <${process.env.EMAIL_USER}>`,
      to: process.env.STUDIO_EMAIL,
      subject: `New Booking: ${booking.name} - ${booking.date} ${booking.slotLabel}`,
      html: studioHtml
    })
  ];

  return Promise.all(mailPromises);
}

module.exports = { sendBookingEmails };
