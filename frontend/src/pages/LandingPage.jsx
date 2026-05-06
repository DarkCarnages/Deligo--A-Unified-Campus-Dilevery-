import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="hero-banner">
        <div className="container">
          <div className="hero-text">
            <div className="hero-badge">Campus Delivery Platform</div>
            <h1>Deligo</h1>
            <p>Order food, beverages and stationery from campus vendors — delivered straight to your hostel or classroom.</p>
            <div className="hero-btns">
              <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ background: '#fff' }}>Sign In</Link>
            </div>
          </div>

          <div className="hero-features">
            <div className="hf-item">
              <span className="hf-icon">🍱</span>
              <div>
                <strong>Food &amp; Beverages</strong>
                <p>From campus canteens and cafes</p>
              </div>
            </div>
            <div className="hf-item">
              <span className="hf-icon">📓</span>
              <div>
                <strong>Stationery &amp; Supplies</strong>
                <p>Notebooks, pens, art supplies &amp; more</p>
              </div>
            </div>
            <div className="hf-item">
              <span className="hf-icon">🚀</span>
              <div>
                <strong>Fast Campus Delivery</strong>
                <p>Delivered to your exact campus location</p>
              </div>
            </div>
            <div className="hf-item">
              <span className="hf-icon">🔒</span>
              <div>
                <strong>Secure Payments</strong>
                <p>UPI, cards or cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#2874f0', color: '#fff', width: 24, height: 24, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>D</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Deligo</span>
          </div>
          <p style={{ color: '#888', fontSize: 13 }}>&copy; 2024 Deligo Campus Delivery System</p>
        </div>
      </footer>
    </div>
  );
}
