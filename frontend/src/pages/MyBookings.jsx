import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';
import { FiMapPin, FiCalendar, FiClock, FiCreditCard } from 'react-icons/fi';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="section-header" style={{ textAlign: 'left', padding: '0 0 24px' }}>
        <h2>My Bookings</h2>
        <p>View and manage your ticket reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Start exploring events and reserve your first ticket.</p>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Events</Link>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="booking-card" id={`booking-${booking.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span className="booking-ref">{booking.booking_ref}</span>
                  <span className={`booking-status status-${booking.status}`}>{booking.status}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>{booking.event_title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><FiMapPin />{booking.event_venue}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCalendar />{new Date(booking.event_date).toLocaleDateString()} <FiClock />{booking.event_time}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCreditCard />Seats: {booking.seats?.map(s => s.seat_number).join(', ') || `${booking.num_seats} tickets`}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price" style={{ marginBottom: 12 }}>
                  <span className="price-currency">LKR </span>
                  {parseFloat(booking.total_amount).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {booking.status === 'pending' && (
                    <Link to={`/payment/${booking.id}`} state={{ booking }} className="btn btn-sm btn-primary">Pay Now</Link>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(booking.id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
