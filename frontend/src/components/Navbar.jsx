import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">EventSphere</Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/events" className={isActive('/events')}>Events</Link>
          {user ? (
            <>
              <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
              <div className="navbar-user">
                <span>Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout} className="btn btn-sm btn-secondary">
                  <FiLogOut style={{ marginRight: 6 }} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                <FiUser style={{ marginRight: 6 }} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
