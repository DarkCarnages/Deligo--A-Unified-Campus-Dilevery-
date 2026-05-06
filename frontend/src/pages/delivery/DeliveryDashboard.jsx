import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Delivery.css';

const TRANSITIONS = { READY: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
const ACTION_LABELS = { OUT_FOR_DELIVERY: '🚴 Pick Up & Start', DELIVERED: '✅ Mark Delivered' };
const STATUS_META = {
  READY:            { label: 'Ready', color: '#9c27b0', bg: '#f3e5f5' },
  OUT_FOR_DELIVERY: { label: 'In Transit', color: '#0288d1', bg: '#e1f5fe' },
  DELIVERED:        { label: 'Delivered',  color: '#388e3c', bg: '#e8f5e9' },
  CANCELLED:        { label: 'Cancelled',  color: '#f44336', bg: '#ffebee' },
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchOrders = () => API.get('/orders/').then(r => setOrders(r.data)).catch(() => {});
  useEffect(() => { fetchOrders().finally(() => setLoading(false)); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await API.put(`/orders/${orderId}/status/`, { status });
      toast.success('Status updated!');
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed.'); }
    finally { setUpdating(p => ({ ...p, [orderId]: false })); }
  };

  const active = orders.filter(o => ['READY','OUT_FOR_DELIVERY'].includes(o.status));
  const done = orders.filter(o => o.status === 'DELIVERED');

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return (
    <div className="dd-root">
      <div className="dd-banner">
        <div className="container">
          <div className="dd-banner-inner">
            <div>
              <div className="dd-banner-label">Delivery Portal</div>
              <h1 className="dd-banner-title">Hey, {user?.first_name || 'Agent'} 👋</h1>
              <p className="dd-banner-sub"><strong>{active.length}</strong> active deliveries</p>
            </div>
            <div className="dd-summary-pills">
              {[
                { count: orders.filter(o => o.status === 'READY').length, label: 'Ready', bg: '#f3e5f5', color: '#9c27b0' },
                { count: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length, label: 'In Transit', bg: '#e1f5fe', color: '#0288d1' },
                { count: done.length, label: 'Delivered', bg: '#e8f5e9', color: '#388e3c' },
              ].map(p => (
                <div key={p.label} className="dd-pill" style={{ background: p.bg, color: p.color }}>
                  <strong>{p.count}</strong><span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {orders.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '3.5rem' }}>📭</div>
            <h3>No orders assigned</h3>
            <p>You'll see deliveries here once they are assigned to you.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="dd-section">
                <h2 className="dd-section-title">🚴 Active Deliveries</h2>
                <div className="dd-orders-grid">
                  {active.map(order => {
                    const meta = STATUS_META[order.status] || {};
                    const nextStatus = TRANSITIONS[order.status];
                    return (
                      <div key={order.id} className="dd-order-card">
                        <div className="dd-order-header">
                          <div>
                            <span className="dd-order-id">{order.order_id}</span>
                            <div className="dd-order-time">
                              {new Date(order.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                          <span className="dd-status-tag" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className="dd-order-address">
                          <span>📍</span><span>{order.delivery_address}</span>
                        </div>
                        <div className="dd-order-items">
                          {order.items?.map((i, idx) => (
                            <span key={idx} className="dd-item-chip">{i.product_name} ×{i.quantity}</span>
                          ))}
                        </div>
                        <div className="dd-order-footer">
                          <div className="dd-order-amount">₹{order.total_price}</div>
                          <div className="dd-order-actions">
                            {order.customer_detail?.phone_number && (
                              <a href={`tel:${order.customer_detail.phone_number}`} className="dd-call-btn">📞 Call</a>
                            )}
                            {nextStatus && (
                              <button className="dd-action-btn" disabled={updating[order.order_id]}
                                onClick={() => updateStatus(order.order_id, nextStatus)}>
                                {updating[order.order_id] ? 'Updating...' : ACTION_LABELS[nextStatus]}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {done.length > 0 && (
              <div className="dd-section">
                <h2 className="dd-section-title">✅ Completed</h2>
                <div className="dd-done-list">
                  {done.map(order => (
                    <div key={order.id} className="dd-done-row">
                      <span className="dd-order-id">{order.order_id}</span>
                      <span className="dd-done-addr">{order.delivery_address}</span>
                      <strong>₹{order.total_price}</strong>
                      <span className="dd-status-tag" style={{ background: '#e8f5e9', color: '#388e3c' }}>Delivered ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
