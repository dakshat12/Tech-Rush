import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/volunteers/me/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      setError('Could not load your tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await axiosInstance.put(`/tasks/${taskId}/status`, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      setError('Could not update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const badgeClass = { pending: 'badge-neutral', in_progress: 'badge-warning', done: 'badge-success' };

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}>My Tasks</h2>

      {error && <p className="msg-error">{error}</p>}

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />
        </>
      ) : tasks.length === 0 ? (
        <p className="msg-empty">No tasks assigned yet.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="card">
            <h3 style={{ marginBottom: 4 }}>{task.event.title}</h3>
            <p style={{ margin: '0 0 12px', fontSize: 14 }}>{task.taskDesc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className={`badge ${badgeClass[task.status] || 'badge-neutral'}`}>
                {task.status.replace('_', ' ')}
              </span>
              <select
                className="input"
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                disabled={updatingId === task.id}
                style={{ width: 'auto', padding: '6px 10px' }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Tasks;
