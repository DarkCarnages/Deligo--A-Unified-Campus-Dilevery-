import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_price: '0.00', total_items: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role !== 'CUSTOMER') return;
    try {
      setCartLoading(true);
      const { data } = await API.get('/cart/');
      setCart(data);
    } catch { /* ignore */ } finally { setCartLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await API.post('/cart/items/', { product: productId, quantity });
    setCart(data);
    return data;
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await API.put(`/cart/items/${itemId}/`, { quantity });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await API.delete(`/cart/items/${itemId}/`);
    setCart(data);
  };

  const clearCart = async () => {
    await API.delete('/cart/clear/');
    setCart({ items: [], total_price: '0.00', total_items: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, cartLoading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
