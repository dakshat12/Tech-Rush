import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {user.role === 'ORGANIZER' && (
          <Link to="/organizer/dashboard" className={isActive('/organizer/dashboard') ? 'active' : ''}>
            Dashboard
          </Link>
        )}
        {user.role === 'ATTENDEE' && (
          <>
            <Link to="/attendee/events" className={isActive('/attendee/events') ? 'active' : ''}>
              Browse Events
            </Link>
            <Link to="/attendee/registrations" className={isActive('/attendee/registrations') ? 'active' : ''}>
              My Registrations
            </Link>
          </>
        )}
        {user.role === 'VOLUNTEER' && (
          <>
            <Link to="/volunteer/tasks" className={isActive('/volunteer/tasks') ? 'active' : ''}>
              My Tasks
            </Link>
            <Link to="/volunteer/scan" className={isActive('/volunteer/scan') ? 'active' : ''}>
              Scan QR
            </Link>
          </>
        )}
      </div>
      <div className="navbar-user">
        <span>{user.name}</span>
        <button className="btn btn-secondary" onClick={logout} style={{ padding: '6px 14px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
