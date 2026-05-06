import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = () => API.get('/vendors/approvals/').then(r => setVendors(r.data)).catch(() => {});
  useEffect(() => { fetchVendors().finally(() => setLoading(false)); }, []);

  const toggleApproval = async (vendor) => {
    try {
      await API.put(`/vendors/approvals/${vendor.id}/`, { is_approved: !vendor.is_approved });
      toast.success(`Vendor ${vendor.is_approved ? 'suspended' : 'approved'}`);
      fetchVendors();
    } catch { toast.error('Failed.'); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>Vendor Management</h1><p>{vendors.length} vendors registered</p></div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Shop</th><th>Owner</th><th>Phone</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.shop_name}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{v.description?.slice(0, 50)}</div>
                    </td>
                    <td>
                      <div>{v.user?.first_name} {v.user?.last_name}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>@{v.user?.username}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{v.user?.phone_number || '—'}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge ${v.is_approved ? 'badge-success' : 'badge-warning'}`}>{v.is_approved ? 'Approved' : 'Pending'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${v.is_approved ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleApproval(v)}>
                        {v.is_approved ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
