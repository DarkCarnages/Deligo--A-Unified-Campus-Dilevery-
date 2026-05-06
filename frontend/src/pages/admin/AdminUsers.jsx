import { useState, useEffect } from 'react';
import API from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchUsers = () => API.get('/auth/users/').then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { fetchUsers().finally(() => setLoading(false)); }, []);

  const toggleActive = async (user) => {
    try {
      await API.put(`/auth/users/${user.id}/`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed.'); }
  };

  const filtered = users.filter(u =>
    !filter || u.username.includes(filter) || u.email.includes(filter) || u.role === filter.toUpperCase()
  );

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between">
          <div><h1>Users</h1><p>{users.length} total users</p></div>
          <input placeholder="Search by name, email or role..." value={filter}
            onChange={e => setFilter(e.target.value)} style={{ maxWidth: 280 }} />
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>@{u.username} · {u.email}</div>
                    </td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'VENDOR' ? 'badge-accent' : u.role === 'DELIVERY' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.phone_number || '—'}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleActive(u)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
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
