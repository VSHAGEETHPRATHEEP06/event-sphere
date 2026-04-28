import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { eventAPI, bookingAPI } from '../services/api';
import { FiMapPin, FiCalendar, FiClock, FiTag } from 'react-icons/fi';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 10;

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, seatsRes] = await Promise.all([
          eventAPI.getById(id),
          bookingAPI.getBookedSeats(id),
        ]);
        setEvent(eventRes.data.event);
        setBookedSeats(seatsRes.data.booked_seats || []);
      } catch (err) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : prev.length < 10 ? [...prev, seatId] : prev
    );
  };

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (selectedSeats.length === 0) { toast.error('Please select at least one seat'); return; }

    setBooking(true);
    try {
      const res = await bookingAPI.create({ event_id: parseInt(id), seats: selectedSeats });
      toast.success('Booking created! Proceeding to payment...');
      navigate(`/payment/${res.data.booking.id}`, {
        state: { booking: res.data.booking },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>Loading event...</p></div>;
  if (!event) return null;

  const totalAmount = selectedSeats.length * parseFloat(event.price);
  const totalRows = Math.ceil(event.total_seats / SEATS_PER_ROW);
  const rows = ROWS.slice(0, Math.min(totalRows, ROWS.length));

  return (
    <div className="container event-detail">
      <div className="event-header">
        <img src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'} alt={event.title} />
        <div className="event-header-overlay">
          <span className="badge">{event.category?.name || 'Event'}</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0' }}>{event.title}</h1>
        </div>
      </div>

      <div className="event-info-grid">
        <div>
          <div className="event-meta">
            <span className="event-meta-item"><FiMapPin />{event.venue}</span>
            <span className="event-meta-item"><FiCalendar />{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="event-meta-item"><FiClock />{event.event_time}</span>
            <span className="event-meta-item" style={{ color: 'var(--success)' }}><FiTag />{event.available_seats} seats available</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>{event.description}</p>

          <div className="seat-map-container">
            <h3 className="seat-map-title">Select Your Seats</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Click on available seats to select (max 10).</p>
            <div className="seat-map-stage">STAGE</div>
            <div className="seat-grid">
              {rows.map((row) =>
                Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const isBooked = bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  return (
                    <div key={seatId}
                      className={`seat ${isBooked ? 'seat-booked' : ''} ${isSelected ? 'seat-selected' : ''}`}
                      onClick={() => toggleSeat(seatId)}
                      title={isBooked ? 'Booked' : seatId}
                      id={`seat-${seatId}`}>
                      {seatId}
                    </div>
                  );
                })
              )}
            </div>
            <div className="seat-legend">
              <div className="seat-legend-item"><div className="seat-legend-box available"></div> Available</div>
              <div className="seat-legend-item"><div className="seat-legend-box selected"></div> Selected</div>
              <div className="seat-legend-item"><div className="seat-legend-box booked"></div> Booked</div>
            </div>
          </div>
        </div>

        <div>
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-row">
              <span className="label">Event</span>
              <span className="value" style={{ fontSize: '0.85rem', textAlign: 'right', maxWidth: '60%' }}>{event.title}</span>
            </div>
            <div className="summary-row">
              <span className="label">Price per ticket</span>
              <span className="value">LKR {parseFloat(event.price).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="label">Selected seats</span>
              <span className="value">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
            </div>
            <div className="summary-row">
              <span className="label">Quantity</span>
              <span className="value">{selectedSeats.length}</span>
            </div>
            <div className="summary-row summary-total">
              <span className="label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
              <span className="value">LKR {totalAmount.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 20 }}
              onClick={handleBooking} disabled={selectedSeats.length === 0 || booking}
              id="book-now-btn">
              {booking ? 'Processing...' : user ? `Book ${selectedSeats.length} Ticket${selectedSeats.length !== 1 ? 's' : ''}` : 'Login to Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
