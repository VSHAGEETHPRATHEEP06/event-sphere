import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiTag, FiZap, FiTrendingUp, FiShield, FiCloud, FiArrowRight } from 'react-icons/fi';
import EventCard from '../components/EventCard';
import { eventAPI } from '../services/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventAPI.getAll({ limit: 6, status: 'upcoming' });
        setEvents(res.data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const stats = [
    { label: 'Events', value: '50+', icon: <FiCalendar /> },
    { label: 'Users', value: '1,000+', icon: <FiUsers /> },
    { label: 'Tickets Sold', value: '5,000+', icon: <FiTag /> },
    { label: 'Uptime', value: '99.9%', icon: <FiZap /> },
  ];

  const features = [
    { title: 'Scalable', desc: 'Handles thousands of concurrent bookings with resilient microservices.', icon: <FiTrendingUp /> },
    { title: 'Secure', desc: 'JWT authentication, encrypted tokens, and safe payment flows.', icon: <FiShield /> },
    { title: 'Reliable', desc: 'Redis seat locking prevents double bookings across sessions.', icon: <FiCloud /> },
    { title: 'Fast', desc: 'Optimized requests and efficient caching for instant browsing.', icon: <FiZap /> },
  ];

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Discover outstanding events near you</h1>
          <p>Book tickets for concerts, sports, conferences, and experiences with a fast, polished cloud-native interface.</p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary" id="hero-browse-btn">Browse Events</Link>
            <Link to="/register" className="btn btn-secondary" id="hero-signup-btn">Create Account</Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <h3 className="card-title">{stat.value}</h3>
              <p className="card-text">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <p>Discover events curated for your next experience.</p>
        </div>
        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No events available</h3>
            <p>Check back soon for upcoming experiences.</p>
          </div>
        )}
        <div style={{ textAlign: 'center', paddingBottom: 40 }}>
          <Link to="/events" className="btn btn-secondary">View All Events <FiArrowRight style={{ marginLeft: 6 }} /></Link>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 24px 60px' }}>
        <div className="section-header">
          <h2>Why EventSphere?</h2>
          <p>Designed for modern event discovery with clarity and speed.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
