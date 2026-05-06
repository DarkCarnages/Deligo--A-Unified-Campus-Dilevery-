import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './Customer.css';

const CATEGORY_ICONS = {
  'Food': '🍱', 'Beverages': '☕', 'Snacks': '🍿', 'Breakfast': '🥞',
  'Lunch': '🍛', 'Dinner': '🍽️', 'Desserts': '🍰', 'Stationery': '✏️',
  'Notebooks': '📓', 'Office': '📎', 'Art': '🎨', 'Electronics': '🔌',
  'Books': '📚', 'Default': '🛍️',
};
const getCategoryIcon = (name) => {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.Default;
};

const OFFERS = [
  '🔥 Free delivery on orders above ₹99',
  '⚡ 20-minute delivery guarantee',
  '🎉 New user? Get ₹50 off your first order',
  '🌙 Late night cravings? We deliver till midnight',
  '⭐ Rate your order and earn reward points',
  '🛒 Add 3+ items and save 10%',
];

const MIND_CATEGORIES = [
  { icon: '🍕', label: 'Pizza', search: 'pizza' },
  { icon: '🍔', label: 'Burgers', search: 'burger' },
  { icon: '🍜', label: 'Noodles', search: 'noodles' },
  { icon: '☕', label: 'Coffee', search: 'coffee' },
  { icon: '🍰', label: 'Desserts', search: 'dessert' },
  { icon: '🥗', label: 'Healthy', search: 'salad' },
  { icon: '🌯', label: 'Wraps', search: 'wrap' },
  { icon: '📚', label: 'Books', search: 'book' },
  { icon: '✏️', label: 'Stationery', search: 'pen' },
  { icon: '🔌', label: 'Electronics', search: 'electronics' },
];

const StarRating = ({ rating }) => (
  <span className="stars">
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= rating ? 'filled' : ''}`}>★</span>)}
  </span>
);

export default function CustomerHome() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [adding, setAdding] = useState({});
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    API.get('/products/categories/').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    API.get(`/products/?${params.toString()}`).then(r => setProducts(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, [search, activeCategory, minPrice, maxPrice]);

  const handleAddToCart = async (productId) => {
    setAdding(p => ({ ...p, [productId]: true }));
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add to cart.'); }
    finally { setAdding(p => ({ ...p, [productId]: false })); }
  };

  const clearFilters = () => { setSearch(''); setActiveCategory(''); setMinPrice(''); setMaxPrice(''); };
  const hasFilters = search || activeCategory || minPrice || maxPrice;

  return (
    <div className="ch-root">
      {/* ── Hero Banner ── */}
      <div className="ch-hero">
        <div className="ch-hero-inner">
          <div className="ch-hero-text">
            <p className="ch-hero-label">🎓 Campus Delivery</p>
            <h1>Hungry? 😋<br/>We've got you covered.</h1>
            <p className="ch-hero-sub">
              Order food, stationery & more from campus vendors — delivered right to your door in minutes.
            </p>
            <div className="ch-hero-badges">
              <span className="ch-hero-badge">⚡ 20 min avg</span>
              <span className="ch-hero-badge">🛡️ Safe delivery</span>
              <span className="ch-hero-badge">💳 COD available</span>
            </div>
          </div>
          <div className="ch-hero-cards">
            <div className="ch-hero-card"><span>🍱</span><strong>Food</strong></div>
            <div className="ch-hero-card"><span>☕</span><strong>Beverages</strong></div>
            <div className="ch-hero-card"><span>✏️</span><strong>Stationery</strong></div>
            <div className="ch-hero-card"><span>🚀</span><strong>Fast</strong></div>
          </div>
        </div>
      </div>

      {/* ── Offer Strip ── */}
      <div className="ch-offer-strip">
        <div className="ch-offer-scroll">
          {[...OFFERS, ...OFFERS].map((o, i) => (
            <span key={i} className="ch-offer-chip"><span>🏷️</span>{o}</span>
          ))}
        </div>
      </div>

      <div className="ch-main">
        {/* ── Search Bar ── */}
        <div className="ch-search-wrap">
          <div className="ch-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search for food, stationery, beverages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="ch-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <Link to="/cart" className="ch-cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
          </Link>
        </div>

        {/* ── What's on your mind ── */}
        {!hasFilters && (
          <div className="ch-mind-section">
            <div className="ch-section-header">
              <div>
                <div className="ch-section-title">What's on your mind? 🤔</div>
              </div>
            </div>
            <div className="ch-mind-grid">
              {MIND_CATEGORIES.map(m => (
                <button key={m.label} className="ch-mind-card" onClick={() => setSearch(m.search)}>
                  <div className="ch-mind-icon">{m.icon}</div>
                  <div className="ch-mind-label">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Category Pills ── */}
        <div className="ch-categories">
          <button className={`ch-cat-pill ${activeCategory === '' ? 'active' : ''}`} onClick={() => setActiveCategory('')}>
            <span className="ch-cat-icon">🏪</span>
            <span>All</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`ch-cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)}
            >
              <span className="ch-cat-icon">{getCategoryIcon(cat.name)}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* ── Filters Row ── */}
        <div className="ch-filters-row">
          <div className="ch-price-inputs">
            <span className="ch-filter-label">Price:</span>
            <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="ch-price-input" />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>—</span>
            <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="ch-price-input" />
          </div>
          {hasFilters && (
            <button className="ch-clear-btn" onClick={clearFilters}>✕ Clear</button>
          )}
          <span className="ch-result-count">
            {!loading && `${products.length} item${products.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* ── Section title ── */}
        {!hasFilters && (
          <div className="ch-section-header" style={{ marginBottom: 14 }}>
            <div className="ch-section-title">🔥 Popular Right Now</div>
          </div>
        )}

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '4rem' }} />
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3>No items found</h3>
            <p>Try a different category or search term.</p>
            {hasFilters && <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear Filters</button>}
          </div>
        ) : (
          <div className="ch-products-grid">
            {products.map((p, idx) => (
              <div key={p.id} className="ch-product-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                <Link to={`/product/${p.id}`} className="ch-product-img-wrap">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} />
                    : <div className="ch-product-placeholder">{getCategoryIcon(p.category_name)}</div>
                  }
                  <span className="ch-category-badge">{p.category_name}</span>
                  <span className="ch-veg-badge" title="Veg" />
                </Link>
                <div className="ch-product-body">
                  <div className="ch-product-vendor">{p.vendor_detail?.shop_name}</div>
                  <Link to={`/product/${p.id}`}>
                    <h3 className="ch-product-name">{p.name}</h3>
                  </Link>
                  <div className="ch-product-rating">
                    <StarRating rating={Math.round(p.avg_rating)} />
                    <span className="ch-rating-count">({p.total_ratings})</span>
                  </div>
                  <div className="ch-product-footer">
                    <span className="ch-product-price">{p.price}</span>
                    <button
                      className="ch-add-btn"
                      onClick={() => handleAddToCart(p.id)}
                      disabled={adding[p.id]}
                    >
                      {adding[p.id] ? '...' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
