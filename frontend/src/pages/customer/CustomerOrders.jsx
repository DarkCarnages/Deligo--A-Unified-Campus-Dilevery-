import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import './Customer.css';

const STATUS_LABELS = {
  PLACED:'Placed', ACCEPTED:'Accepted', PREPARING:'Preparing',
  READY:'Ready', OUT_FOR_DELIVERY:'Out for Delivery', DELIVERED:'Delivered', CANCELLED:'Cancelled'
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header"><h1>My Orders</h1><p>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p></div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3>No orders yet</h3>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : orders.map(order => (
          <Link to={`/orders/${order.order_id}`} key={order.id} style={{ display: 'block' }}>
            <div className="order-card card">
              <div className="order-header">
                <div>
                  <div className="order-id">{order.order_id}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <div style={{ fontWeight: 700, marginTop: '0.4rem' }}>₹{order.total_price}</div>
                </div>
              </div>
              <div className="order-items-preview">
                {order.items?.slice(0, 3).map(i => i.product_name).join(', ')}
                {order.items?.length > 3 && ` +${order.items.length - 3} more`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
