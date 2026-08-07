import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ATTENDEE' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/signup', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Sign up</h2>
        {success ? (
          <p className="msg-success">Account created — taking you to login...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input className="input" type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>I am a</label>
              <select className="input" name="role" value={form.role} onChange={handleChange}>
                <option value="ATTENDEE">Attendee</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>
            {error && <p className="msg-error">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading && <span className="spinner" />}
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        )}
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
