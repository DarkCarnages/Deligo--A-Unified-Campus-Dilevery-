import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Customer.css';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Your order has been received.' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Vendor accepted your order.' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Your order is being prepared.' },
  { key: 'READY', label: 'Ready', desc: 'Order ready for pickup/delivery.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'On the way to you!' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Order delivered. Enjoy!' },
];

const ORDER_KEYS = ['PLACED','ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED'];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ product: '', rating: 0, comment: '', order: orderId });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewFor, setShowReviewFor] = useState(null);

  const fetchOrder = () => {
    API.get(`/orders/${orderId}/`).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const submitReview = async (productId) => {
    if (review.rating === 0) { toast.error('Please select a rating.'); return; }
    setSubmittingReview(true);
    try {
      await API.post('/products/reviews/', { product: productId, order: order.id, rating: review.rating, comment: review.comment });
      toast.success('Review submitted!');
      setShowReviewFor(null);
      setReview({ product: '', rating: 0, comment: '', order: orderId });
    } catch (err) {
      toast.error(err.response?.data?.[0] || err.response?.data?.non_field_errors?.[0] || 'Failed to submit review.');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
  if (!order) return <div className="container page"><div className="empty-state"><h3>Order not found</h3></div></div>;

  const currentIdx = ORDER_KEYS.indexOf(order.status);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>Order #{order.order_id}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
              {order.status_display}
            </span>
            <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.2rem' }}>₹{order.total_price}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery To</h3>
            <p>{order.delivery_address}</p>
            {order.special_instructions && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{order.special_instructions}</p>}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment</h3>
            <span className={`badge ${order.is_paid ? 'badge-success' : 'badge-warning'}`}>{order.is_paid ? 'Paid' : 'Pending'}</span>
            {order.status === 'OUT_FOR_DELIVERY' && order.delivery_partner_detail?.phone && (
              <div style={{ marginTop: '1rem' }}>
                <a href={`tel:${order.delivery_partner_detail.phone}`} className="btn btn-success btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  📞 Call Delivery Partner
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Order Progress</h3>
            <div className="tracking-timeline">
              {STEPS.map((step, idx) => {
                const done = idx < currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={step.key} className="timeline-step">
                    <div className={`timeline-dot ${done ? 'done' : active ? 'active' : ''}`}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <div className="timeline-content">
                      <h4 style={{ color: done || active ? 'var(--text)' : 'var(--text-dim)' }}>{step.label}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Items Ordered</h3>
          {order.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Qty: {item.quantity} × ₹{item.unit_price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700 }}>₹{item.subtotal}</span>
                {order.status === 'DELIVERED' && item.product && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowReviewFor(item.product); setReview(r => ({ ...r, product: item.product })); }}>
                    Rate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Review Form */}
        {showReviewFor && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
            <div className="star-input">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={review.rating >= s ? 'active' : ''} onClick={() => setReview(r => ({ ...r, rating: s }))}>★</button>
              ))}
            </div>
            <textarea rows={3} placeholder="Share your experience..." value={review.comment}
              onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} style={{ marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => submitReview(showReviewFor)} disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowReviewFor(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
