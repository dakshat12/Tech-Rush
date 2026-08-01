import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ATTENDEE' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/auth/signup', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Sign Up</h2>
      {success ? (
        <p style={{ color: 'green' }}>Account created! Redirecting to login...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>I am a:</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="ATTENDEE">Attendee</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: 10 }}>Sign Up</button>
        </form>
      )}
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
