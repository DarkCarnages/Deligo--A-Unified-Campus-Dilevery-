import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY = { name: '', zone_type: 'HOSTEL', address_keywords: '', is_active: true };
const ZONE_TYPES = [{ value: 'HOSTEL', label: 'Hostel' }, { value: 'DEPT', label: 'Department' }, { value: 'ACADEMIC', label: 'Academic Building' }, { value: 'COMMON', label: 'Common Area' }];

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchZones = () => API.get('/campus/admin/zones/').then(r => setZones(r.data)).catch(() => {});
  useEffect(() => { fetchZones().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await API.put(`/campus/admin/zones/${editing}/`, form); toast.success('Zone updated!'); }
      else { await API.post('/campus/admin/zones/', form); toast.success('Zone added!'); }
      setEditing(null); setForm(EMPTY); setShowForm(false);
      fetchZones();
    } catch { toast.error('Failed to save zone.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return;
    try { await API.delete(`/campus/admin/zones/${id}/`); toast.success('Deleted'); fetchZones(); }
    catch { toast.error('Failed.'); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between">
          <div><h1>Campus Zones</h1><p>{zones.length} delivery zones configured</p></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }}>+ Add Zone</button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem', maxWidth: 560 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Zone' : 'Add Campus Zone'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Zone Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Hostel A" />
                </div>
                <div className="form-group"><label>Zone Type *</label>
                  <select value={form.zone_type} onChange={e => setForm(p => ({ ...p, zone_type: e.target.value }))}>
                    {ZONE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address Keywords *</label>
                <input value={form.address_keywords} onChange={e => setForm(p => ({ ...p, address_keywords: e.target.value }))} required placeholder="hostel a, hostel-a, ha block (comma separated)" />
                <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>Comma-separated keywords that will match customer delivery addresses.</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ width: 'auto' }} />
                <label htmlFor="active" style={{ margin: 0 }}>Active (customers can deliver to this zone)</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Zone' : 'Add Zone'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Zone Name</th><th>Type</th><th>Keywords</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id}>
                  <td style={{ fontWeight: 600 }}>{z.name}</td>
                  <td><span className="badge badge-info">{z.zone_type}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 280 }}>{z.address_keywords}</td>
                  <td><span className={`badge ${z.is_active ? 'badge-success' : 'badge-danger'}`}>{z.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditing(z.id); setForm({ name: z.name, zone_type: z.zone_type, address_keywords: z.address_keywords, is_active: z.is_active }); setShowForm(true); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(z.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
