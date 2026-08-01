import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/volunteers/me/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      setError('Failed to load tasks');
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
      setError('Failed to update task');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = {
    pending: '#888',
    in_progress: '#f57c00',
    done: '#2e7d32',
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>My Tasks</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {tasks.length === 0 && <p style={{ color: '#888' }}>No tasks assigned yet.</p>}

      {tasks.map((task) => (
        <div key={task.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 4px 0' }}>{task.event.title}</h3>
          <p style={{ margin: '0 0 8px 0' }}>{task.taskDesc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 12,
                color: '#fff',
                background: statusColor[task.status] || '#888',
              }}
            >
              {task.status.replace('_', ' ')}
            </span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              disabled={updatingId === task.id}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tasks;
