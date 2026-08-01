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
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', venue: '', startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await axiosInstance.get('/events');
      const myEvents = res.data.events.filter((e) => e.organizerId === user.id);
      setEvents(myEvents);
      if (myEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(myEvents[0].id);
      }
    } catch (err) {
      setError('Could not load your events. Check your connection and try again.');
    } finally {
      setLoadingEvents(false);
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
      setError('Could not load analytics for this event.');
    }
  }, [selectedEventId]);

  const fetchAssignments = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const res = await axiosInstance.get(`/events/${selectedEventId}/volunteers`);
      setAssignments(res.data.assignments);
    } catch (err) {
      setAssignments([]);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAnalytics();
    fetchAssignments();
  }, [fetchAnalytics, fetchAssignments]);

  useEffect(() => {
    if (!selectedEventId) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('join_event_room', selectedEventId);
    socket.on('attendance_update', (data) => {
      setLiveLog((prev) => [data, ...prev].slice(0, 10));
      fetchAnalytics();
    });
    return () => socket.disconnect();
  }, [selectedEventId, fetchAnalytics]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setFormError(err.response?.data?.error || 'Could not create the event. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignVolunteer = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssigning(true);
    try {
      await axiosInstance.post(`/events/${selectedEventId}/assign`, { volunteerEmail, taskDesc });
      setVolunteerEmail('');
      setTaskDesc('');
      await fetchAssignments();
    } catch (err) {
      setAssignError(err.response?.data?.error || 'Could not assign volunteer.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Organizer Dashboard</h2>
        <button className="btn btn-secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {error && <p className="msg-error">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreateEvent} className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>New event</h3>
          <div className="field">
            <label>Title</label>
            <input className="input" type="text" name="title" placeholder="e.g. Tech Fest 2026" value={form.title} onChange={handleFormChange} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="input" name="description" placeholder="What is this event about?" value={form.description} onChange={handleFormChange} style={{ minHeight: 70, resize: 'vertical' }} required />
          </div>
          <div className="field">
            <label>Venue</label>
            <input className="input" type="text" name="venue" placeholder="e.g. Main Auditorium" value={form.venue} onChange={handleFormChange} required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start time</label>
              <input className="input" type="datetime-local" name="startTime" value={form.startTime} onChange={handleFormChange} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End time</label>
              <input className="input" type="datetime-local" name="endTime" value={form.endTime} onChange={handleFormChange} required />
            </div>
          </div>
          {formError && <p className="msg-error">{formError}</p>}
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating && <span className="spinner" />}
            {creating ? 'Creating...' : 'Create event'}
          </button>
        </form>
      )}

      <div className="field" style={{ maxWidth: 320 }}>
        <label>Select event</label>
        {loadingEvents ? (
          <div className="skeleton" style={{ height: 38 }} />
        ) : events.length === 0 ? (
          <p className="msg-empty" style={{ textAlign: 'left', padding: '8px 0' }}>
            You haven't created any events yet. Click "+ Create Event" to get started.
          </p>
        ) : (
          <select className="input" value={selectedEventId || ''} onChange={(e) => setSelectedEventId(parseInt(e.target.value))}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        )}
      </div>

      {analytics && (
        <div className="stats-row" style={{ marginTop: 20 }}>
          <div className="stat-card">
            <div className="stat-value">{analytics.totalRegistered}</div>
            <div className="stat-label">Total Registered</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{analytics.currentlyCheckedIn}</div>
            <div className="stat-label">Currently Checked In</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.checkedOut}</div>
            <div className="stat-label">Checked Out</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.noShows}</div>
            <div className="stat-label">No Shows</div>
          </div>
        </div>
      )}

      {selectedEventId && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Volunteers</h3>
          <form onSubmit={handleAssignVolunteer} className="card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
            <input className="input" type="email" placeholder="Volunteer's email" value={volunteerEmail} onChange={(e) => setVolunteerEmail(e.target.value)} style={{ flex: 1, minWidth: 180 }} required />
            <input className="input" type="text" placeholder="Task description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} style={{ flex: 2, minWidth: 200 }} required />
            <button type="submit" disabled={assigning} className="btn btn-primary">
              {assigning && <span className="spinner" />}
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </form>
          {assignError && <p className="msg-error">{assignError}</p>}

          {assignments.length === 0 ? (
            <p className="msg-empty">No volunteers assigned yet.</p>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{a.volunteer?.name}</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{a.taskDesc}</p>
                </div>
                <span className={`badge ${a.status === 'done' ? 'badge-success' : a.status === 'in_progress' ? 'badge-warning' : 'badge-neutral'}`}>
                  {a.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 12 }}>Live Activity</h3>
        {liveLog.length === 0 ? (
          <p className="msg-empty">No check-in activity yet — updates will appear here in real time.</p>
        ) : (
          liveLog.map((entry, i) => (
            <div key={i} className="card" style={{ padding: '12px 16px' }}>
              <strong>{entry.userName}</strong> {entry.type === 'check_in' ? 'checked in' : 'checked out'}
              <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 8 }}>
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
