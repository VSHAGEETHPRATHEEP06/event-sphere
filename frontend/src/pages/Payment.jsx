import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI } from '../services/api';
import { FiCheckCircle, FiXCircle, FiLock, FiCreditCard } from 'react-icons/fi';

const Payment = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [form, setForm] = useState({
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    payment_method: 'card',
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await paymentAPI.process({
        booking_id: parseInt(bookingId),
        booking_ref: booking?.booking_ref || '',
        amount: booking?.total_amount || 0,
        event_title: booking?.event_title,
        event_venue: booking?.event_venue,
        event_date: booking?.event_date,
        seats: Array.isArray(booking?.seats) ? booking.seats : [],
        payment_method: form.payment_method,
        card_number: form.card_number.replace(/\s/g, ''),
        card_expiry: form.card_expiry,
        card_cvv: form.card_cvv,
      });
      setResult(res.data);
      if (res.data.payment.status === 'completed') {
        toast.success('Payment successful!');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.payment?.status === 'failed') {
        setResult(errData);
        toast.error('Payment declined.');
      } else {
        toast.error(errData?.error || 'Payment error');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    const success = result.payment?.status === 'completed';
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>
            {success ? <FiCheckCircle /> : <FiXCircle />}
          </div>
          <h2 style={{ background: 'none', WebkitTextFillColor: success ? 'var(--success)' : 'var(--danger)' }}>
            {success ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p className="subtitle">{success ? 'Your tickets are confirmed. Check your email for details.' : 'Your payment was declined. Please try again.'}</p>
          {result.payment && (
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 20, margin: '20px 0', textAlign: 'left' }}>
              <div className="summary-row"><span className="label">Transaction ID</span><span className="value" style={{ fontSize: '0.8rem' }}>{result.payment.transaction_id}</span></div>
              <div className="summary-row"><span className="label">Amount</span><span className="value" style={{ color: 'var(--success)' }}>LKR {parseFloat(result.payment.amount).toLocaleString()}</span></div>
              <div className="summary-row"><span className="label">Status</span><span className={`booking-status status-${success ? 'confirmed' : 'failed'}`}>{result.payment.status}</span></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            {!success && <button className="btn btn-secondary" onClick={() => setResult(null)}>Try Again</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div className="payment-form">
          <h3 style={{ marginBottom: 8 }}>Complete Payment</h3>
          {booking && (
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 24 }}>
              <div className="summary-row"><span className="label">Booking</span><span className="booking-ref">{booking.booking_ref}</span></div>
              <div className="summary-row"><span className="label">Event</span><span className="value" style={{ fontSize: '0.85rem' }}>{booking.event_title}</span></div>
              <div className="summary-row"><span className="label">Seats</span><span className="value">{Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.num_seats}</span></div>
              <div className="summary-row summary-total"><span className="label" style={{ fontWeight: 700 }}>Total</span><span className="value">LKR {parseFloat(booking.total_amount).toLocaleString()}</span></div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" className="form-control" placeholder="1234 5678 9012 3456" maxLength={19}
                value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} required id="card-number" />
            </div>
            <div className="card-input-group">
              <div className="form-group">
                <label>Expiry</label>
                <input type="text" className="form-control" placeholder="MM/YY" maxLength={5}
                  value={form.card_expiry} onChange={(e) => setForm({ ...form, card_expiry: e.target.value })} required id="card-expiry" />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="text" className="form-control" placeholder="123" maxLength={4}
                  value={form.card_cvv} onChange={(e) => setForm({ ...form, card_cvv: e.target.value })} required id="card-cvv" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={processing} id="pay-btn">
              {processing ? 'Processing...' : `Pay LKR ${booking ? parseFloat(booking.total_amount).toLocaleString() : '0'}`}
            </button>
          </form>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FiLock /> Payment is simulated for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
