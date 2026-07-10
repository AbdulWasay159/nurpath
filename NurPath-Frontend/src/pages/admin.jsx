import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();

  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersFetching, setUsersFetching] = useState(true);
  const [userActionLoading, setUserActionLoading] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setUsersFetching(true);
    try { const res = await api.get('/admin/users'); setUsers(res.data.data || []); }
    catch { /* silent */ } finally { setUsersFetching(false); }
  };

  const handleMakeAdmin = async (id, name) => {
    if (!confirm(`Make "${name}" an admin?`)) return;
    setUserActionLoading(id);
    try {
      await api.put(`/admin/users/${id}/make-admin`);
      showToast(`${name} is now an admin! 🛡️`);
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update.', 'error'); }
    finally { setUserActionLoading(null); }
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!confirm(`Remove admin access from "${name}"?`)) return;
    setUserActionLoading(id);
    try {
      await api.put(`/admin/users/${id}/remove-admin`);
      showToast(`${name} is no longer an admin.`);
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update.', 'error'); }
    finally { setUserActionLoading(null); }
  };

  const handleToggleActive = async (id, name, isActive) => {
    const verb = isActive ? 'Deactivate' : 'Reactivate';
    if (!confirm(`${verb} "${name}"?`)) return;
    setUserActionLoading(id);
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      showToast(`${name} ${isActive ? 'deactivated' : 'reactivated'}.`);
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update.', 'error'); }
    finally { setUserActionLoading(null); }
  };

  return (
    <AppLayout requireAdmin>
      <div className="min-h-screen p-6 md:p-10 text-white">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl
            ${toast.type === 'success' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🛠️ Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and admin access.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-yellow-400">🛡️ Manage Users</h2>
              <p className="text-sm text-gray-500 mt-1">Promote trusted users to admin, or deactivate accounts.</p>
            </div>
            <span className="text-sm text-gray-500">{users.length} total</span>
          </div>

          {usersFetching ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-gray-800" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="bg-card border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
              <p className="text-4xl mb-3">👤</p><p>No users yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {users.map((u) => (
                <div key={u._id}
                  className="bg-card border border-gray-800 hover:border-yellow-700/30 rounded-2xl p-5 transition flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400 shrink-0">Admin</span>
                        )}
                        {u.isActive === false && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 shrink-0">Deactivated</span>
                        )}
                        {u._id === user?._id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 shrink-0">You</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{u.email}{u.city ? ` · ${u.city}` : ''}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {u._id !== user?._id && (
                      <button onClick={() => handleToggleActive(u._id, u.name, u.isActive !== false)} disabled={userActionLoading === u._id}
                        className="text-xs text-gray-400 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        {u.isActive === false ? 'Reactivate' : 'Deactivate'}
                      </button>
                    )}
                    {u.role === 'admin' ? (
                      u._id !== user?._id && (
                        <button onClick={() => handleRemoveAdmin(u._id, u.name)} disabled={userActionLoading === u._id}
                          className="text-xs text-red-500 hover:text-red-400 border border-red-700/40 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                          {userActionLoading === u._id ? 'Updating...' : 'Remove Admin'}
                        </button>
                      )
                    ) : (
                      <button onClick={() => handleMakeAdmin(u._id, u.name)} disabled={userActionLoading === u._id}
                        className="text-xs text-yellow-500 hover:text-yellow-400 border border-yellow-700/40 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        {userActionLoading === u._id ? 'Updating...' : 'Make Admin'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
