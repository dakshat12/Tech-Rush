import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/registrations/me');
        setRegistrations(res.data.registrations);
      } catch (err) {
        setError('Could not load your registrations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const badgeClass = {
    registered: 'badge-neutral',
    checked_in: 'badge-success',
    checked_out: 'badge-primary',
  };

  return (
    <div className="page">
      <h2 style={{ marginBottom: 8 }}>My Registrations</h2>
      <p style={{ marginBottom: 20 }}>
        <Link to="/attendee/events">← Browse more events</Link>
      </p>

      {error && <p className="msg-error">{error}</p>}

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
        </>
      ) : registrations.length === 0 ? (
        <p className="msg-empty">You haven't registered for any events yet.</p>
      ) : (
        registrations.map((reg) => (
          <div key={reg.id} className="card">
            <h3 style={{ marginBottom: 4 }}>{reg.event.title}</h3>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-faint)' }}>
              {reg.event.venue} · {new Date(reg.event.startTime).toLocaleDateString()}
            </p>
            <span className={`badge ${badgeClass[reg.status] || 'badge-neutral'}`}>
              {reg.status.replace('_', ' ')}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default MyRegistrations;
