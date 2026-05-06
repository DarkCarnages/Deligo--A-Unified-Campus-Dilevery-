import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Auth.css';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Browse & order from campus vendors' },
  { value: 'VENDOR', label: 'Vendor', desc: 'Sell your products to campus community' },
  { value: 'DELIVERY', label: 'Delivery Partner', desc: 'Deliver orders across campus' },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', role: params.get('role') || 'CUSTOMER',
    phone_number: '', shop_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/', form);
      login(data.user, data.access, data.refresh);
      toast.success('Account created successfully!');
      const map = { CUSTOMER: '/shop', VENDOR: '/vendor', DELIVERY: '/delivery', ADMIN: '/admin' };
      navigate(map[data.user.role] || '/');
    } catch (err) {
      const errs = err.response?.data;
      if (typeof errs === 'object') {
        const msgs = Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join('. ');
        setError(msgs);
      } else setError('Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card auth-card-wide card">
        <div className="auth-header">
          <div className="auth-logo">D</div>
          <h1>Create Account</h1>
          <p>Join the Deligo campus delivery network</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Role selector */}
        <div className="role-selector">
          {ROLES.map(r => (
            <button key={r.value} type="button"
              className={`role-btn ${form.role === r.value ? 'active' : ''}`}
              onClick={() => setForm(p => ({ ...p, role: r.value }))}>
              <strong>{r.label}</strong>
              <span>{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input placeholder="First name" value={form.first_name}
                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input placeholder="Last name" value={form.last_name}
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input placeholder="Choose a username" value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input placeholder="10-digit mobile number" value={form.phone_number}
                onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} />
            </div>
            {form.role === 'VENDOR' && (
              <div className="form-group">
                <label>Shop Name *</label>
                <input placeholder="Your shop name" value={form.shop_name}
                  onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))} required />
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.password2}
                onChange={e => setForm(p => ({ ...p, password2: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
