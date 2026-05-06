import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Vendor.css';

const STATUS_COLORS = {
  PLACED: '#3d6cf4', ACCEPTED: '#3d6cf4', PREPARING: '#f59e0b',
  READY: '#7c3aed', OUT_FOR_DELIVERY: '#0ea5e9', DELIVERED: '#1ec16b', CANCELLED: '#ef4444',
};

const STATUS_BG = {
  PLACED: '#dbeafe', ACCEPTED: '#dbeafe', PREPARING: '#fef3c7',
  READY: '#ede9fe', OUT_FOR_DELIVERY: '#e0f2fe', DELIVERED: '#d1fae5', CANCELLED: '#fee2e2',
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseFloat(value) || 0;
    let start = 0;
    const step = num / 30;
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(start);
      if (start >= num) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{typeof value === 'string' && value.startsWith('₹')
    ? `₹${parseFloat(display).toFixed(0)}`
    : Math.round(display)}</span>;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/orders/'),
      API.get('/vendors/profile/'),
    ]).then(([o, p]) => { setOrders(o.data); setProfile(p.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['PLACED','ACCEPTED','PREPARING','READY'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + parseFloat(o.total_price), 0).toFixed(0),
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  const statCards = [
    { icon: '📦', label: 'Total Orders', value: stats.total, color: '#3d6cf4', bg: '#dbeafe', sub: `${stats.cancelled} cancelled` },
    { icon: '⏳', label: 'Active Orders', value: stats.pending, color: '#f59e0b', bg: '#fef3c7', sub: 'Needs attention' },
    { icon: '✅', label: 'Delivered', value: stats.delivered, color: '#1ec16b', bg: '#d1fae5', sub: 'Completed' },
    { icon: '💰', label: 'Revenue', value: `₹${stats.revenue}`, color: '#7c3aed', bg: '#ede9fe', sub: 'From deliveries' },
  ];

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return (
    <div className="vd-root">
      {/* ── Banner ── */}
      <div className="vd-banner">
        <div className="vd-banner-inner">
          <div>
            <div className="vd-banner-label">🏪 Vendor Portal</div>
            <h1 className="vd-banner-title">
              {profile?.shop_name || user?.first_name + "'s Shop"}
            </h1>
            <div className="vd-banner-meta">
              <span className="vd-store-id">Store ID #{profile?.id || '—'}</span>
              {profile?.is_approved
                ? <span className="vd-badge-approved">✓ Approved & Active</span>
                : <span className="vd-badge-pending">⏳ Pending Approval</span>
              }
            </div>
          </div>
          <div className="vd-banner-actions">
            <Link to="/vendor/products" className="vd-action-btn primary">+ Add Product</Link>
            <Link to="/vendor/orders" className="vd-action-btn outline">View Orders</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* ── Approval Alert ── */}
        {!profile?.is_approved && (
          <div className="vd-alert-pending">
            <span className="vd-alert-icon">⚠️</span>
            <div>
              <strong>Account Pending Approval</strong>
              <p>Your vendor account is under review. Products won't be visible to customers until an admin approves your account.</p>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="vd-stats-grid">
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className="vd-stat-card"
              style={{ borderTop: `3px solid ${s.color}`, animationDelay: `${i * 0.08}s` }}
            >
              <div className="vd-stat-icon-wrap" style={{ background: s.bg }}>
                <span>{s.icon}</span>
              </div>
              <div>
                <div className="vd-stat-value" style={{ color: s.color }}>
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="vd-stat-label">{s.label}</div>
                <div className="vd-stat-sub" style={{ color: s.color + 'aa' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="vd-quick-actions">
          <Link to="/vendor/products" className="vd-qa-card">
            <div className="vd-qa-icon">📦</div>
            <div>
              <strong>Manage Products</strong>
              <p>Add, edit or remove products from your catalogue</p>
            </div>
            <span className="vd-qa-arrow">→</span>
          </Link>
          <Link to="/vendor/orders" className="vd-qa-card">
            <div className="vd-qa-icon">🧾</div>
            <div>
              <strong>View All Orders</strong>
              <p>Accept, prepare and track all customer orders</p>
            </div>
            <span className="vd-qa-arrow">→</span>
          </Link>
        </div>

        {/* ── Recent Orders ── */}
        <div className="vd-section-card">
          <div className="vd-section-header">
            <h2>Recent Orders</h2>
            <Link to="/vendor/orders" className="vd-see-all">See all →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🛒</div>
              <h3>No orders yet</h3>
              <p>Orders from customers will appear here.</p>
            </div>
          ) : (
            <table className="vd-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(order => (
                  <tr key={order.id}>
                    <td><span className="vd-order-id">{order.order_id}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td><strong style={{ fontSize: 14 }}>₹{order.total_price}</strong></td>
                    <td>
                      <span className="vd-status-pill" style={{
                        background: STATUS_BG[order.status] || '#f1f5f9',
                        color: STATUS_COLORS[order.status] || '#475569'
                      }}>
                        {order.status_display}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
