import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/client';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './Customer.css';

const StarRating = ({ rating }) => (
  <span className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= rating ? 'filled' : ''}`}>★</span>)}</span>
);

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/products/${id}/`),
      API.get(`/products/${id}/reviews/`)
    ]).then(([p, r]) => { setProduct(p.data); setReviews(r.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(parseInt(id), qty); toast.success(`${qty}x ${product.name} added to cart!`); }
    catch { toast.error('Failed to add.'); }
    finally { setAdding(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
  if (!product) return <div className="container page"><div className="empty-state"><h3>Product not found</h3></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="product-detail-layout">
          <div className="product-detail-img">
            {product.image_url ? <img src={product.image_url} alt={product.name} /> :
              <div className="product-detail-img-placeholder">{product.category_name === 'Food' ? '🍱' : '✏️'}</div>}
          </div>
          <div className="product-detail-info">
            <div>
              <span className="badge badge-primary">{product.category_name}</span>
              {product.subcategory_name && <span className="badge badge-accent" style={{ marginLeft: 8 }}>{product.subcategory_name}</span>}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{product.name}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>by <strong style={{ color: 'var(--primary)' }}>{product.vendor_detail?.shop_name}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StarRating rating={Math.round(product.avg_rating)} />
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{product.avg_rating} ({product.total_ratings} reviews)</span>
            </div>
            <div className="product-detail-price">₹{product.price}</div>
            {product.description && <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.description}</p>}
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>= ₹{(product.price * qty).toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAdd} disabled={adding || !product.is_available}>
              {!product.is_available ? 'Currently Unavailable' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="empty-state"><p>No reviews yet. Be the first to review after ordering!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14 }}>
                        {r.customer_name?.[0] || r.customer_username?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.customer_name || r.customer_username}</div>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '3rem' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
