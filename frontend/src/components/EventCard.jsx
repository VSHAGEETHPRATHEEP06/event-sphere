import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

const EventCard = ({ event }) => {
  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" id={`event-card-${event.id}`}>
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
          alt={event.title}
          className="card-img"
          loading="lazy"
        />
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span className="badge">{event.category?.name || 'Event'}</span>
            <div className="price">
              <span className="price-currency">LKR </span>
              {parseFloat(event.price).toLocaleString()}
            </div>
          </div>
          <h3 className="card-title">{event.title}</h3>
          <p className="card-text"><FiMapPin />{event.venue}</p>
          <p className="card-text"><FiCalendar />{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
          <p className="card-text"><FiClock />{event.event_time}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ color: event.available_seats > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
              {event.available_seats > 0 ? `${event.available_seats} seats left` : 'Sold Out'}
            </span>
            <span className="btn btn-sm btn-primary">Book Now <FiArrowRight /></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
