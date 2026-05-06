import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Vendor.css';

const VENDOR_TRANSITIONS = { PLACED: ['ACCEPTED','CANCELLED'], ACCEPTED: ['PREPARING'], PREPARING: ['READY'] };

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchOrders = () => API.get('/orders/').then(r => setOrders(r.data)).catch(() => {});

  useEffect(() => { fetchOrders().finally(() => setLoading(false)); }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await API.put(`/orders/${orderId}/status/`, { status: newStatus });
      toast.success(`Order ${newStatus.toLowerCase()}`);
      await fetchOrders();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update.'); }
    finally { setUpdating(p => ({ ...p, [orderId]: false })); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>Orders</h1><p>{orders.length} total orders</p></div>
        {orders.length === 0 ? (
          <div className="empty-state"><h3>No orders yet</h3><p>Orders will appear here once customers start ordering.</p></div>
        ) : orders.map(order => (
          <div key={order.id} className="card" style={{ marginBottom: '1rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <span className="order-id">{order.order_id}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                  {new Date(order.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700 }}>₹{order.total_price}</span>
                <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                  {order.status_display}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Delivery to: {order.delivery_address}</div>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}
            </div>
            {VENDOR_TRANSITIONS[order.status] && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {VENDOR_TRANSITIONS[order.status].map(s => (
                  <button key={s} className={`btn btn-sm ${s === 'CANCELLED' ? 'btn-danger' : 'btn-primary'}`}
                    disabled={updating[order.order_id]} onClick={() => updateStatus(order.order_id, s)}>
                    {s === 'ACCEPTED' ? 'Accept Order' : s === 'CANCELLED' ? 'Cancel' : s === 'PREPARING' ? 'Start Preparing' : s === 'READY' ? 'Mark Ready' : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
