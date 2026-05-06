import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/client';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './Customer.css';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [zoneValid, setZoneValid] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [validating, setValidating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [payMode, setPayMode] = useState('cod');

  useEffect(() => {
    API.get('/campus/zones/').then(r => setZones(r.data)).catch(() => {});
  }, []);

  const validateAddress = async () => {
    if (!address.trim()) return;
    setValidating(true);
    try {
      const { data } = await API.post('/campus/validate-address/', { address });
      setZoneValid(true); setZoneInfo(data.zone);
      toast.success(`Delivery available to ${data.zone.name}`);
    } catch (err) {
      setZoneValid(false); setZoneInfo(null);
      toast.error(err.response?.data?.message || 'Delivery not available to this address.');
    } finally { setValidating(false); }
  };

  const handlePlaceOrder = async () => {
    if (!zoneValid) { toast.error('Please validate your delivery address first.'); return; }
    if (!cart.items?.length) { toast.error('Your cart is empty.'); return; }
    setPlacing(true);
    try {
      const { data: order } = await API.post('/orders/', { delivery_address: address, special_instructions: instructions });
      if (payMode === 'online') {
        const { data: payment } = await API.post('/payments/create-order/', { order_id: order.order_id });
        // Razorpay checkout
        if (window.Razorpay) {
          const rzp = new window.Razorpay({
            key: payment.key_id,
            amount: payment.amount,
            currency: 'INR',
            name: 'Deligo',
            description: `Order ${order.order_id}`,
            order_id: payment.razorpay_order_id,
            handler: async (response) => {
              await API.post('/payments/verify/', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment successful!');
              await fetchCart();
              navigate(`/orders/${order.order_id}`);
            },
          });
          rzp.open();
        } else {
          toast.success('Order placed! (Test mode - payment skipped)');
          await fetchCart();
          navigate(`/orders/${order.order_id}`);
        }
      } else {
        toast.success('Order placed successfully!');
        await fetchCart();
        navigate(`/orders/${order.order_id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order.');
    } finally { setPlacing(false); }
  };

  if (!cart.items?.length) return (
    <div className="page"><div className="container"><div className="empty-state">
      <h3>Cart is empty</h3>
      <p>Add items before checking out.</p>
    </div></div></div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>Checkout</h1><p>Complete your order</p></div>
        <div className="checkout-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Address */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Delivery Address</h3>
              <div className="form-group">
                <label>Campus Location</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input placeholder="e.g. Hostel A, Room 204" value={address}
                    onChange={e => { setAddress(e.target.value); setZoneValid(null); }} style={{ flex: 1 }} />
                  <button className="btn btn-outline" onClick={validateAddress} disabled={validating || !address.trim()}>
                    {validating ? '...' : 'Validate'}
                  </button>
                </div>
                {zoneValid === true && <div className="alert alert-success" style={{ marginTop: '0.5rem' }}>
                  Delivery zone: <strong>{zoneInfo?.name}</strong>
                </div>}
                {zoneValid === false && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>
                  Delivery not available to this address.
                </div>}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Available zones:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {zones.map(z => (
                    <button key={z.id} className="badge badge-primary" style={{ cursor: 'pointer', background: 'rgba(108,71,255,0.1)' }}
                      onClick={() => { setAddress(z.name); setZoneValid(null); }}>
                      {z.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Special instructions */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Special Instructions</h3>
              <textarea rows={3} placeholder="Any delivery instructions or dietary notes..."
                value={instructions} onChange={e => setInstructions(e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            {/* Payment */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Payment Method</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[{ value: 'cod', label: 'Cash on Delivery' }, { value: 'online', label: 'Pay Online (Razorpay)' }].map(m => (
                  <button key={m.value} className={`role-btn ${payMode === m.value ? 'active' : ''}`}
                    style={{ flex: 1 }} onClick={() => setPayMode(m.value)}>
                    <strong>{m.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary-card card">
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
            {cart.items.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.product_detail?.name} × {item.quantity}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span><span>₹{cart.total_price}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={handlePlaceOrder} disabled={placing || !zoneValid}>
              {placing ? 'Placing Order...' : `Place Order · ₹${cart.total_price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
