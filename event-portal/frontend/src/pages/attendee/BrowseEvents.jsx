import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

const BrowseEvents = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    setError('');
    setMessage('');
    setQrCode(null);
    setRegisteringId(eventId);
    try {
      const res = await axiosInstance.post(`/events/${eventId}/register`);
      setMessage('Registered successfully! Here is your QR code:');
      setQrCode(res.data.qrCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Browse Events</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {qrCode && (
        <div style={{ textAlign: 'center', margin: '24px 0', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <img src={qrCode} alt="Your QR Code" style={{ width: 220, height: 220 }} />
          <p style={{ fontSize: 13, color: '#666' }}>Show this at check-in</p>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {events.length === 0 && <p style={{ color: '#888' }}>No events available yet.</p>}
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>{event.title}</h3>
              <p style={{ margin: '0 0 4px 0', color: '#555' }}>{event.description}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                {event.venue} · {new Date(event.startTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleRegister(event.id)}
              disabled={registeringId === event.id}
              style={{ padding: '8px 16px' }}
            >
              {registeringId === event.id ? 'Registering...' : 'Register'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseEvents;
