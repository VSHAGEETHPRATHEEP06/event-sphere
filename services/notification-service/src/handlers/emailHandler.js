const nodemailer = require('nodemailer');
const { bookingConfirmation, bookingCancellation } = require('../templates/emailTemplates');

// Create transporter
let transporter;

const initTransporter = async () => {
  // If no SMTP credentials provided, create Ethereal test account
  if (!process.env.SMTP_USER || process.env.SMTP_USER === '') {
    console.log('📧 No SMTP credentials found. Creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal test account: ${testAccount.user}`);
    console.log(`📧 View emails at: https://ethereal.email/login`);
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

/**
 * Handle payment completed - send confirmation email
 */
const handlePaymentCompleted = async (message) => {
  try {
    console.log(`📧 Sending confirmation email for booking: ${message.booking_ref}`);

    const html = bookingConfirmation(message);
    const fromEmail = process.env.SMTP_FROM || 'noreply@eventsphere.com';

    const info = await transporter.sendMail({
      from: `"EventSphere" <${fromEmail}>`,
      to: message.user_email,
      subject: `🎟️ Booking Confirmed - ${message.event_title} | ${message.booking_ref}`,
      html,
    });

    console.log(`✅ Confirmation email sent: ${info.messageId}`);

    // Log Ethereal preview URL if available
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
  }
};

/**
 * Handle booking cancelled - send cancellation email
 */
const handleBookingCancelled = async (message) => {
  try {
    console.log(`📧 Sending cancellation email for booking: ${message.booking_ref}`);

    const html = bookingCancellation(message);
    const fromEmail = process.env.SMTP_FROM || 'noreply@eventsphere.com';

    const info = await transporter.sendMail({
      from: `"EventSphere" <${fromEmail}>`,
      to: message.user_email,
      subject: `Booking Cancelled - ${message.event_title} | ${message.booking_ref}`,
      html,
    });

    console.log(`✅ Cancellation email sent: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error);
  }
};

module.exports = { initTransporter, handlePaymentCompleted, handleBookingCancelled };
