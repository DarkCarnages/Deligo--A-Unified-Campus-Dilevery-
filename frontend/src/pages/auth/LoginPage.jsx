import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login/', form);
      login(data.user, data.access, data.refresh);
      toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`);
      const map = { CUSTOMER: '/shop', VENDOR: '/vendor', DELIVERY: '/delivery', ADMIN: '/admin' };
      navigate(map[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">D</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Deligo account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username or Email</label>
            <input type="text" placeholder="Enter username or email" value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up free</Link></p>
        </div>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts</p>
          <div className="demo-grid">
            {[
              { role: 'Admin', u: 'admin', p: 'admin123' },
              { role: 'Vendor', u: 'vendor1', p: 'vendor123' },
              { role: 'Customer', u: 'student1', p: 'student123' },
              { role: 'Delivery', u: 'delivery1', p: 'delivery123' },
            ].map(d => (
              <button key={d.role} className="demo-btn"
                onClick={() => setForm({ username: d.u, password: d.p })}>
                <strong>{d.role}</strong>
                <span>{d.u}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
