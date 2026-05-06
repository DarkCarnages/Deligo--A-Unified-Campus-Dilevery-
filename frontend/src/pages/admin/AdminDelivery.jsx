import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminDelivery() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = () => {
    API.get('/auth/users/')
      .then(r => {
        // Filter only DELIVERY role
        const deliveryPartners = r.data.filter(u => u.role === 'DELIVERY');
        setPartners(deliveryPartners);
      })
      .catch(() => toast.error('Failed to load delivery partners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const toggleStatus = async (partner) => {
    try {
      await API.put(`/auth/users/${partner.id}/`, { is_active: !partner.is_active });
      toast.success(`Partner ${partner.is_active ? 'suspended' : 'activated'}`);
      fetchPartners();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Delivery Partner Verification</h1>
          <p>{partners.length} delivery partners registered</p>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username / Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      <div className="empty-state" style={{ padding: '20px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚴</div>
                        <h3>No Delivery Partners</h3>
                        <p>No users have registered with the delivery partner role yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  partners.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.first_name || '—'} {p.last_name || ''}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>@{p.username}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{p.email || 'No email'}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.phone_number || '—'}</td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {new Date(p.date_joined || new Date()).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {p.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${p.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleStatus(p)}
                        >
                          {p.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
