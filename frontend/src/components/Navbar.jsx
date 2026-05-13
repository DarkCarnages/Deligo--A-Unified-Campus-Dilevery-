import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../api/client';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      API.get('/notifications/').then(r => setNotifCount(r.data.unread_count)).catch(() => {});
      const interval = setInterval(() => {
        API.get('/notifications/').then(r => setNotifCount(r.data.unread_count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getRoleHome = () => {
    if (!user) return '/';
    const map = { CUSTOMER: '/shop', VENDOR: '/vendor', DELIVERY: '/delivery', ADMIN: '/admin' };
    return map[user.role] || '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={getRoleHome()} className="navbar-brand">
          {/* <span className="brand-icon">D</span> */}
          <img src="/logo.png" alt="Deligo Logo" className="brand-icon" />
          <span className="brand-name">Deligo</span>
        </Link>

        {user && (
          <div className="navbar-links hide-mobile">
            {user.role === 'CUSTOMER' && <>
              <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
              <Link to="/orders" className={location.pathname.startsWith('/orders') ? 'active' : ''}>My Orders</Link>
            </>}
            {user.role === 'VENDOR' && <>
              <Link to="/vendor" className={location.pathname === '/vendor' ? 'active' : ''}>Dashboard</Link>
              <Link to="/vendor/products">My Products</Link>
              <Link to="/vendor/orders">Orders</Link>
            </>}
            {user.role === 'DELIVERY' && <Link to="/delivery">My Deliveries</Link>}
            {user.role === 'ADMIN' && <>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Dashboard</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/vendors">Vendors</Link>
              <Link to="/admin/delivery">Delivery Partners</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/zones">Zones</Link>
            </>}
          </div>
        )}

        <div className="navbar-actions">
          {user ? <>
            {user.role === 'CUSTOMER' && (
              <Link to="/cart" className="cart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cart.total_items > 0 && <span className="cart-count">{cart.total_items}</span>}
              </Link>
            )}
            {/* <button className="notif-btn" onClick={() => navigate(user.role === 'CUSTOMER' ? '/orders' : getRoleHome())}> */}
              <button
              className="notif-btn"
              onClick={async () => {

                try {
                  await API.put('/notifications/mark-all-read/');
                  setNotifCount(0);
                } catch {}

                navigate(user.role === 'CUSTOMER' ? '/orders' : getRoleHome());
              }}
              >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
            </button>
            <div className="user-menu">
              <div className="user-avatar">{user.first_name?.[0] || user.username[0]}</div>
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.first_name || user.username}</strong>
                  <span className="badge badge-primary" style={{ fontSize: 11, alignSelf: 'flex-start' }}>{user.role}</span>
                </div>
                <div className="divider" style={{ margin: '6px 0' }} />
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </> : <>
            <Link to="/login" className="btn btn-ghost" style={{ color: '#fff', textTransform: 'none' }}>Login</Link>
            <Link to="/register" className="btn" style={{ background: '#fff', color: '#2874f0', fontWeight: 600, textTransform: 'none' }}>Sign Up</Link>
          </>}
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && user && (
        <div className="mobile-menu">
          {user.role === 'CUSTOMER' && <>
            <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart {cart.total_items > 0 && `(${cart.total_items})`}</Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
          </>}
          {user.role === 'VENDOR' && <>
            <Link to="/vendor" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/vendor/products" onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to="/vendor/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
          </>}
          {user.role === 'DELIVERY' && <Link to="/delivery" onClick={() => setMenuOpen(false)}>My Deliveries</Link>}
          {user.role === 'ADMIN' && <>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Users</Link>
            <Link to="/admin/vendors" onClick={() => setMenuOpen(false)}>Vendors</Link>
            <Link to="/admin/delivery" onClick={() => setMenuOpen(false)}>Delivery</Link>
            <Link to="/admin/zones" onClick={() => setMenuOpen(false)}>Zones</Link>
          </>}
          {/* <button onClick={() => { logout(); setMenuOpen(false); }} className="logout-btn" style={{ marginTop: 4 }}>Logout</button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            
              setTimeout(() => {
                logout();
              }, 0);
            }}
            className="logout-btn"
            style={{ marginTop: 4 }}
>         
            Logout
            </button>
        </div>
      )}
    </nav>
  );
}
