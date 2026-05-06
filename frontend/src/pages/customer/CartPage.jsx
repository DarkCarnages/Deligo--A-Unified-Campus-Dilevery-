import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './Customer.css';

export default function CartPage() {
  const { cart, cartLoading, updateItem, removeItem, clearCart } = useCart();

  if (cartLoading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  if (!cart.items?.length) return (
    <div className="page"><div className="container"><div className="empty-state">
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
      <h3>Your cart is empty</h3>
      <p>Browse products and add them to your cart.</p>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Start Shopping</Link>
    </div></div></div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between">
          <div><h1>Your Cart</h1><p>{cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</p></div>
          <button className="btn btn-outline btn-sm" onClick={() => { clearCart(); toast.success('Cart cleared'); }}>Clear Cart</button>
        </div>

        <div className="cart-layout">
          <div className="card" style={{ padding: 0 }}>
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.product_detail?.image_url
                    ? <img src={item.product_detail.image_url} alt={item.product_detail.name} />
                    : <div className="cart-item-placeholder">{item.product_detail?.category_name === 'Food' ? '🍱' : '✏️'}</div>}
                </div>
                <div>
                  <div className="cart-item-name">{item.product_detail?.name}</div>
                  <div className="cart-item-vendor">{item.product_detail?.vendor_detail?.shop_name}</div>
                  <div className="qty-control" style={{ gap: '0.5rem' }}>
                    <button className="qty-btn" style={{ width: 28, height: 28 }}
                      onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" style={{ width: 28, height: 28 }}
                      onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>₹{item.subtotal}</div>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                    onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-card card">
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
            {cart.items.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.product_detail?.name} × {item.quantity}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <span>₹{cart.total_price}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.25rem' }}>
              Proceed to Checkout →
            </Link>
            <Link to="/shop" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
