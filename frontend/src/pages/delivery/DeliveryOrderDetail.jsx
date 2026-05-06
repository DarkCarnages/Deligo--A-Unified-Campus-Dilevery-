import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function DeliveryOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    API.get(`/orders/${orderId}/`).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data } = await API.put(`/orders/${orderId}/status/`, { status });
      setOrder(data);
      toast.success('Status updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed.'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
  if (!order) return <div className="container page"><div className="empty-state"><h3>Order not found</h3></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Order {order.order_id}</h1>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>{order.status_display}</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{order.total_price}</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}><strong>Deliver to:</strong> {order.delivery_address}</div>
          {order.special_instructions && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Note: {order.special_instructions}</div>}
        </div>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Items</h3>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span>{item.product_name} × {item.quantity}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
        </div>
        {order.customer_detail && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Customer</h3>
            <div>{order.customer_detail.first_name} {order.customer_detail.last_name}</div>
            {order.customer_detail.phone_number && (
              <a href={`tel:${order.customer_detail.phone_number}`} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                📞 Call Customer
              </a>
            )}
          </div>
        )}
        {order.status === 'READY' && (
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={updating} onClick={() => updateStatus('OUT_FOR_DELIVERY')}>
            Start Delivery
          </button>
        )}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <button className="btn btn-success btn-lg" style={{ width: '100%' }} disabled={updating} onClick={() => updateStatus('DELIVERED')}>
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}
