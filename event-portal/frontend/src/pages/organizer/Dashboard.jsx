import { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const [error, setError] = useState('');

  // Fetch all events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/events');
        setEvents(res.data.events);
        if (res.data.events.length > 0) {
          setSelectedEventId(res.data.events[0].id);
        }
      } catch (err) {
        setError('Failed to load events');
      }
    };
    fetchEvents();
  }, []);

  // Fetch analytics whenever the selected event changes
  const fetchAnalytics = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const res = await axiosInstance.get(`/events/${selectedEventId}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      setError('Failed to load analytics (only organizers who own this event can view it)');
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Socket.io — join the event room and listen for live check-in updates
  useEffect(() => {
    if (!selectedEventId) return;

    const socket = io('http://localhost:5000');

    socket.emit('join_event_room', selectedEventId);

    socket.on('attendance_update', (data) => {
      setLiveLog((prev) => [data, ...prev].slice(0, 10)); // keep last 10 events
      fetchAnalytics(); // refresh the counts whenever something happens
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedEventId, fetchAnalytics]);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Organizer Dashboard</h2>
        <div>
          <span style={{ marginRight: 12 }}>Hi, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 24 }}>
        <label>Select event: </label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {analytics && (
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <StatCard label="Total Registered" value={analytics.totalRegistered} />
          <StatCard label="Currently Checked In" value={analytics.currentlyCheckedIn} highlight />
          <StatCard label="Checked Out" value={analytics.checkedOut} />
          <StatCard label="No Shows" value={analytics.noShows} />
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3>Live Activity</h3>
        {liveLog.length === 0 && <p style={{ color: '#888' }}>No check-in activity yet — try scanning a QR code.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {liveLog.map((entry, i) => (
            <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{entry.userName}</strong> {entry.type === 'check_in' ? 'checked in' : 'checked out'} —{' '}
              {new Date(entry.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div
    style={{
      flex: 1,
      padding: 16,
      border: '1px solid #ddd',
      borderRadius: 8,
      textAlign: 'center',
      background: highlight ? '#e8f5e9' : '#fafafa',
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
  </div>
);

export default Dashboard;
