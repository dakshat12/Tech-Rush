import { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    startTime: '',
    endTime: '',
  });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get('/events');
      // Only show events this organizer actually created
      const myEvents = res.data.events.filter((e) => e.organizerId === user.id);
      setEvents(myEvents);
      if (myEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(myEvents[0].id);
      }
    } catch (err) {
      setError('Failed to load events');
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const res = await axiosInstance.get(`/events/${selectedEventId}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      setError('Failed to load analytics');
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!selectedEventId) return;
    const socket = io('http://localhost:5000');
    socket.emit('join_event_room', selectedEventId);
    socket.on('attendance_update', (data) => {
      setLiveLog((prev) => [data, ...prev].slice(0, 10));
      fetchAnalytics();
    });
    return () => socket.disconnect();
  }, [selectedEventId, fetchAnalytics]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      const res = await axiosInstance.post('/events', payload);
      setForm({ title: '', description: '', venue: '', startTime: '', endTime: '' });
      setShowForm(false);
      await fetchEvents();
      setSelectedEventId(res.data.event.id);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Organizer Dashboard</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px' }}>
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showForm && (
        <form
          onSubmit={handleCreateEvent}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}
        >
          <h3 style={{ marginTop: 0 }}>New Event</h3>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={form.title}
              onChange={handleFormChange}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
              style={{ width: '100%', padding: 8, minHeight: 60 }}
              required
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              name="venue"
              placeholder="Venue"
              value={form.venue}
              onChange={handleFormChange}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleFormChange}
                style={{ width: '100%', padding: 8 }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#666' }}>End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleFormChange}
                style={{ width: '100%', padding: 8 }}
                required
              />
            </div>
          </div>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <button type="submit" disabled={creating} style={{ padding: '8px 16px' }}>
            {creating ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 24 }}>
        <label>Select event: </label>
        {events.length === 0 ? (
          <p style={{ color: '#888' }}>You haven't created any events yet.</p>
        ) : (
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
        )}
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
        {liveLog.length === 0 && <p style={{ color: '#888' }}>No check-in activity yet.</p>}
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
