import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

const MyRegistrations = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await axiosInstance.get('/registrations/me');
        setRegistrations(res.data.registrations);
      } catch (err) {
        setError('Failed to load registrations');
      }
    };
    fetchRegistrations();
  }, []);

  const statusColor = {
    registered: '#888',
    checked_in: '#2e7d32',
    checked_out: '#1565c0',
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>My Registrations</h2>

      <p style={{ marginTop: 16 }}>
        <Link to="/attendee/events">← Browse more events</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {registrations.length === 0 && <p style={{ color: '#888' }}>You haven't registered for any events yet.</p>}

      {registrations.map((reg) => (
        <div key={reg.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 4px 0' }}>{reg.event.title}</h3>
          <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#888' }}>
            {reg.event.venue} · {new Date(reg.event.startTime).toLocaleDateString()}
          </p>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              color: '#fff',
              background: statusColor[reg.status] || '#888',
            }}
          >
            {reg.status.replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MyRegistrations;
