import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

const BrowseEvents = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      setError('Could not load events. Check your connection and try again.');
    } finally {
      setLoading(false);
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
      setMessage('You\'re registered — here\'s your QR code:');
      setQrCode(res.data.qrCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not complete registration.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}>Browse Events</h2>

      {error && <p className="msg-error">{error}</p>}
      {message && <p className="msg-success">{message}</p>}

      {qrCode && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src={qrCode} alt="Your QR Code" style={{ width: 200, height: 200 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Show this at check-in</p>
        </div>
      )}

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />
        </>
      ) : events.length === 0 ? (
        <p className="msg-empty">No events available yet — check back soon.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>{event.title}</h3>
              <p style={{ margin: '0 0 4px', color: 'var(--text-muted)', fontSize: 14 }}>{event.description}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-faint)' }}>
                {event.venue} · {new Date(event.startTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleRegister(event.id)}
              disabled={registeringId === event.id}
              className="btn btn-primary"
            >
              {registeringId === event.id && <span className="spinner" />}
              {registeringId === event.id ? 'Registering...' : 'Register'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BrowseEvents;
