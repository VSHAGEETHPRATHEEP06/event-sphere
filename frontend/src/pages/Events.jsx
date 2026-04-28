import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { eventAPI } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await eventAPI.getAll(params);
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await eventAPI.getCategories();
        setCategories(res.data.categories);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => { fetchEvents(); }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="container">
      <div className="section-header">
        <h2>All Events</h2>
        <p>Find and book tickets for the best local and national events.</p>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <input type="text" className="form-control" placeholder="Search events, venues..."
          value={search} onChange={(e) => setSearch(e.target.value)} id="search-events" />
        <select className="form-control" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          id="filter-category" style={{ flex: '0 0 auto' }}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" id="search-btn">Search events</button>
      </form>

      {loading ? (
        <div className="loading-page"><div className="spinner"></div></div>
      ) : events.length > 0 ? (
        <>
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 0 40px' }}>
              <button className="btn btn-sm btn-secondary" disabled={page === 1}
                onClick={() => setPage(page - 1)}>Prev</button>
              <span style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button className="btn btn-sm btn-secondary" disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No events found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
