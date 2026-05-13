import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [selectedPartner, setSelectedPartner] = useState({});

  useEffect(() => {
    Promise.all([
      API.get('/orders/').then(r => setOrders(r.data)),
      API.get('/auth/delivery-partners/').then(r => setPartners(r.data)),
    ]).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const assignDelivery = async (orderId) => {
    const partnerId = selectedPartner[orderId];
    if (!partnerId) { toast.error('Select a delivery partner first.'); return; }
    setAssigning(p => ({ ...p, [orderId]: true }));
    try {
      await API.post(`/orders/${orderId}/assign-delivery/`, { delivery_partner_id: parseInt(partnerId) });
      toast.success('Delivery partner assigned!');
      API.get('/orders/').then(r => setOrders(r.data));
    } catch { toast.error('Failed.'); }
    finally { setAssigning(p => ({ ...p, [orderId]: false })); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status/`, { status });
      toast.success('Status updated');
      API.get('/orders/').then(r => setOrders(r.data));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed.'); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>All Orders</h1><p>{orders.length} total orders</p></div>
        {orders.map(order => (
          <div key={order.id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{order.order_id}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{new Date(order.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700 }}>₹{order.total_price}</span>
                <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>{order.status_display}</span>
                <span className={`badge ${order.is_paid ? 'badge-success' : 'badge-warning'}`}>{order.is_paid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              <strong>Customer:</strong> {order.customer_detail?.first_name} {order.customer_detail?.last_name} · <strong>To:</strong> {order.delivery_address}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              {order.items?.map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {!order.delivery_partner && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <>
                  <select style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    value={selectedPartner[order.order_id] || ''}
                    onChange={e => setSelectedPartner(p => ({ ...p, [order.order_id]: e.target.value }))}>
                    <option value="">Assign delivery...</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                  <button className="btn btn-primary btn-sm" disabled={assigning[order.order_id]}
                    onClick={() => assignDelivery(order.order_id)}>Assign</button>
                </>
              )}
              {/* {order.delivery_partner_detail && (
                <span style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                  Delivery: {order.delivery_partner_detail.name} · {order.delivery_partner_detail.phone}
                </span>
              )} */}

              {order.delivery_partner_detail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                  <span style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                    Delivery: {order.delivery_partner_detail.name} · {order.delivery_partner_detail.phone}
                  </span>

                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    🚴 Auto Assigned
                  </span>

                </div>
              )}
              {['PLACED'].includes(order.status) && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(order.order_id, 'CANCELLED')}>Cancel Order</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
