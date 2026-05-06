import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import CustomerHome from './pages/customer/CustomerHome';
import ProductDetail from './pages/customer/ProductDetail';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrders from './pages/customer/CustomerOrders';
import OrderTracking from './pages/customer/OrderTracking';

import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrderDetail from './pages/delivery/DeliveryOrderDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminOrders from './pages/admin/AdminOrders';
import AdminZones from './pages/admin/AdminZones';
import AdminDelivery from './pages/admin/AdminDelivery';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '10rem' }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

const ROLE_HOME = { CUSTOMER: '/shop', VENDOR: '/vendor', DELIVERY: '/delivery', ADMIN: '/admin' };

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '10rem' }} />;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return <LandingPage />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={user ? <Navigate to={ROLE_HOME[user.role] || '/'} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={ROLE_HOME[user.role] || '/'} /> : <RegisterPage />} />

        {/* Customer */}
        <Route path="/shop" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerHome /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute roles={['CUSTOMER']}><ProductDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute roles={['CUSTOMER']}><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute roles={['CUSTOMER']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerOrders /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute roles={['CUSTOMER']}><OrderTracking /></ProtectedRoute>} />

        {/* Vendor */}
        <Route path="/vendor" element={<ProtectedRoute roles={['VENDOR']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/products" element={<ProtectedRoute roles={['VENDOR']}><VendorProducts /></ProtectedRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoute roles={['VENDOR']}><VendorOrders /></ProtectedRoute>} />

        {/* Delivery */}
        <Route path="/delivery" element={<ProtectedRoute roles={['DELIVERY']}><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/delivery/orders/:orderId" element={<ProtectedRoute roles={['DELIVERY']}><DeliveryOrderDetail /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute roles={['ADMIN']}><AdminVendors /></ProtectedRoute>} />
        <Route path="/admin/delivery" element={<ProtectedRoute roles={['ADMIN']}><AdminDelivery /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={['ADMIN']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/zones" element={<ProtectedRoute roles={['ADMIN']}><AdminZones /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#fff', color: '#212121', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
            duration: 3000,
          }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
