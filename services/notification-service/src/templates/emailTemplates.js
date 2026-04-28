/**
 * Booking confirmation email template
 */
const bookingConfirmation = (data) => {
  const { user_name, booking_ref, event_title, event_venue, event_date, event_time, seats, total_amount, transaction_id } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.25);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">🎉 Booking Confirmed!</h1>
              <p style="color:#e0e7ff;margin:10px 0 0;font-size:16px;">Your tickets are ready</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi <strong style="color:#a78bfa;">${user_name}</strong>,</p>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 30px;">Your booking has been confirmed. Here are your ticket details:</p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:12px;overflow:hidden;margin-bottom:30px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</span>
                          <br>
                          <span style="color:#a78bfa;font-size:18px;font-weight:700;">${booking_ref}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Event</span>
                          <br>
                          <span style="color:#f1f5f9;font-size:16px;font-weight:600;">${event_title}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Venue</span>
                          <br>
                          <span style="color:#e2e8f0;font-size:14px;">${event_venue || 'TBA'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date & Time</span>
                          <br>
                          <span style="color:#e2e8f0;font-size:14px;">${event_date} at ${event_time || 'TBA'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Seats</span>
                          <br>
                          <span style="color:#e2e8f0;font-size:14px;">${Array.isArray(seats) ? seats.join(', ') : seats}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total Amount</span>
                          <br>
                          <span style="color:#22c55e;font-size:20px;font-weight:700;">LKR ${parseFloat(total_amount).toLocaleString()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${transaction_id ? `<p style="color:#64748b;font-size:12px;margin:0 0 20px;">Transaction ID: ${transaction_id}</p>` : ''}

              <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;">Please show this email or your booking reference at the venue entrance.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:24px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:12px;margin:0;">EventSphere &copy; 2026 | Cloud-Native Event Ticketing</p>
              <p style="color:#475569;font-size:11px;margin:5px 0 0;">University of Ruhuna - Faculty of Engineering</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Booking cancellation email template
 */
const bookingCancellation = (data) => {
  const { user_name, booking_ref, event_title, event_venue, event_date, total_amount } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancelled</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">Booking Cancelled</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#e2e8f0;font-size:16px;">Hi <strong>${user_name}</strong>,</p>
              <p style="color:#94a3b8;font-size:14px;">Your booking <strong style="color:#f87171;">${booking_ref}</strong> for <strong>${event_title}</strong> has been cancelled.</p>
              <p style="color:#94a3b8;font-size:14px;">Venue: ${event_venue || 'N/A'}</p>
              <p style="color:#94a3b8;font-size:14px;">Date: ${event_date}</p>
              <p style="color:#94a3b8;font-size:14px;">Refund amount: <strong style="color:#22c55e;">LKR ${parseFloat(total_amount).toLocaleString()}</strong></p>
              <p style="color:#64748b;font-size:13px;margin-top:30px;">If you did not request this cancellation, please contact support.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0f172a;padding:24px;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">EventSphere &copy; 2026</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { bookingConfirmation, bookingCancellation };
