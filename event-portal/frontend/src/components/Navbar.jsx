import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const linkStyle = (path) => ({
    marginRight: 16,
    textDecoration: 'none',
    color: location.pathname === path ? '#1565c0' : '#333',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
  });

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid #ddd',
        fontFamily: 'sans-serif',
      }}
    >
      <div>
        {user.role === 'ORGANIZER' && (
          <Link to="/organizer/dashboard" style={linkStyle('/organizer/dashboard')}>Dashboard</Link>
        )}
        {user.role === 'ATTENDEE' && (
          <>
            <Link to="/attendee/events" style={linkStyle('/attendee/events')}>Browse Events</Link>
            <Link to="/attendee/registrations" style={linkStyle('/attendee/registrations')}>My Registrations</Link>
          </>
        )}
        {user.role === 'VOLUNTEER' && (
          <>
            <Link to="/volunteer/tasks" style={linkStyle('/volunteer/tasks')}>My Tasks</Link>
            <Link to="/volunteer/scan" style={linkStyle('/volunteer/scan')}>Scan QR</Link>
          </>
        )}
      </div>
      <div>
        <span style={{ marginRight: 12, color: '#666' }}>Hi, {user.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
