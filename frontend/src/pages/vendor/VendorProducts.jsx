import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Vendor.css';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', subcategory: '', is_available: true, image: null };

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => API.get('/products/my-products/').then(r => setProducts(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetchProducts(), API.get('/products/categories/').then(r => setCategories(r.data))])
      .finally(() => setLoading(false));
  }, []);

  const subcategories = categories.find(c => c.id === parseInt(form.category))?.subcategories || [];

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category || '', subcategory: p.subcategory || '', is_available: p.is_available, image: null });
    setShowForm(true);
  };

  const resetForm = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
    try {
      if (editing) { await API.put(`/products/${editing}/`, fd); toast.success('Product updated!'); }
      else { await API.post('/products/', fd); toast.success('Product added!'); }
      await fetchProducts();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}/`); toast.success('Deleted'); await fetchProducts(); }
    catch { toast.error('Failed to delete.'); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between">
          <div><h1>My Products</h1><p>{products.length} product{products.length !== 1 ? 's' : ''}</p></div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Product</button>
        </div>

        {showForm && (
          <div className="card product-form" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Product name" />
              </div>
              <div className="form-group"><label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product" />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="0.00" />
                </div>
                <div className="form-group"><label>Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value, subcategory: '' }))} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {subcategories.length > 0 && (
                <div className="form-group"><label>Subcategory</label>
                  <select value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))}>
                    <option value="">Select subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Product Image</label>
                <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, image: e.target.files[0] }))} style={{ padding: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" id="avail" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} style={{ width: 'auto' }} />
                <label htmlFor="avail" style={{ margin: 0 }}>Available for ordering</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}</button>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {products.length === 0 ? (
            <div className="empty-state"><h3>No products yet</h3><p>Add your first product to start selling.</p></div>
          ) : (
            <table className="product-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="product-thumb">
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.category_name === 'Food' ? '🍱' : '✏️')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </td>
                    <td><span className="badge badge-primary">{p.category_name}</span></td>
                    <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                    <td><span className={`badge ${p.is_available ? 'badge-success' : 'badge-danger'}`}>{p.is_available ? 'Available' : 'Hidden'}</span></td>
                    <td>★ {p.avg_rating} ({p.total_ratings})</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
