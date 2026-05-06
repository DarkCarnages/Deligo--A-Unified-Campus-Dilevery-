import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const STAT_CONFIG = [
  { key: 'total_orders',    label: 'Total Orders',      icon: '📦', color: '#2874f0' },
  { key: 'total_users',     label: 'Total Users',       icon: '👥', color: '#9c27b0' },
  { key: 'total_products',  label: 'Total Products',    icon: '🏷️', color: '#0288d1' },
  { key: 'total_revenue',   label: 'Total Revenue',     icon: '💰', color: '#388e3c', prefix: '₹' },
];

const QUICK_LINKS = [
  { title: 'Manage Users',      desc: 'View, activate or deactivate accounts',      to: '/admin/users',   icon: '👥', color: '#9c27b0' },
  { title: 'Vendor Approvals',  desc: 'Approve or reject vendor applications',      to: '/admin/vendors', icon: '🏪', color: '#f59e0b' },
  { title: 'Delivery Partners', desc: 'Verify and manage delivery staff',           to: '/admin/delivery',icon: '🚴', color: '#1ec16b' },
  { title: 'All Orders',        desc: 'Monitor and manage all platform orders',     to: '/admin/orders',  icon: '📦', color: '#3d6cf4' },
  { title: 'Campus Zones',      desc: 'Configure delivery zones and keywords',      to: '/admin/zones',   icon: '📍', color: '#7c3aed' },
];

const STATUS_COLORS = {
  PLACED: '#2874f0', ACCEPTED: '#2874f0', PREPARING: '#ff9f00',
  READY: '#9c27b0', OUT_FOR_DELIVERY: '#0288d1', DELIVERED: '#388e3c', CANCELLED: '#f44336',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/stats/').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return (
    <div className="ad-root">
      {/* ── Header ── */}
      <div className="ad-banner">
        <div className="container">
          <div className="ad-banner-inner">
            <div>
              <div className="ad-banner-label">Admin Console</div>
              <h1 className="ad-banner-title">Welcome back, {user?.first_name || 'Admin'}</h1>
              <p className="ad-banner-sub">Deligo Campus Delivery — Platform Overview</p>
            </div>
            <div className="ad-banner-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* ── Stat Cards ── */}
        <div className="ad-stats-grid">
          {STAT_CONFIG.map(s => (
            <div key={s.key} className="ad-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="ad-stat-icon">{s.icon}</div>
              <div className="ad-stat-body">
                <div className="ad-stat-value" style={{ color: s.color }}>
                  {s.prefix || ''}{stats?.[s.key] ?? '—'}
                </div>
                <div className="ad-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Vendor approval ratio */}
        {stats?.total_vendors != null && (
          <div className="ad-vendor-bar-card">
            <div className="ad-vendor-bar-header">
              <span>Vendor Approvals</span>
              <strong>{stats.approved_vendors} / {stats.total_vendors} approved</strong>
            </div>
            <div className="ad-vendor-bar-track">
              <div
                className="ad-vendor-bar-fill"
                style={{ width: stats.total_vendors > 0 ? `${(stats.approved_vendors / stats.total_vendors) * 100}%` : '0%' }}
              />
            </div>
          </div>
        )}

        <div className="ad-two-col">
          {/* ── Quick Links ── */}
          <div className="ad-section-card">
            <h2 className="ad-section-title">Management</h2>
            <div className="ad-quick-links">
              {QUICK_LINKS.map(item => (
                <Link key={item.title} to={item.to} className="ad-ql-row">
                  <span className="ad-ql-icon" style={{ background: item.color + '1a', color: item.color }}>{item.icon}</span>
                  <div className="ad-ql-text">
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                  <span className="ad-ql-arrow" style={{ color: item.color }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Orders by Status ── */}
          {stats?.orders_by_status && (
            <div className="ad-section-card">
              <h2 className="ad-section-title">Orders by Status</h2>
              <div className="ad-status-grid">
                {Object.entries(stats.orders_by_status).map(([status, count]) => (
                  <div key={status} className="ad-status-cell" style={{ borderLeft: `3px solid ${STATUS_COLORS[status] || '#ccc'}` }}>
                    <div className="ad-status-count" style={{ color: STATUS_COLORS[status] || '#555' }}>{count}</div>
                    <div className="ad-status-name">{status.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
