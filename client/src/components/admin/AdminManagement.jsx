import { useState, useEffect } from 'react';
import { Shield, UserCheck, UserX, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.isSuperAdmin) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [adminsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin-management`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${API_URL}/users?status=approved`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      const adminsData = await adminsRes.json();
      const usersData = await usersRes.json();
      setAdmins(adminsData.admins || []);
      setUsers(usersData.users?.filter(u => u.role !== 'admin') || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId) => {
    if (!confirm('Promote this user to admin?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin-management/promote/${userId}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('User promoted to admin');
        fetchData();
      }
    } catch (error) {
      alert('Failed to promote user');
    }
  };

  const demoteAdmin = async (userId) => {
    if (!confirm('Demote this admin to regular user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin-management/demote/${userId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ demoteTo: 'student' })
      });
      if (res.ok) {
        alert('Admin demoted');
        fetchData();
      }
    } catch (error) {
      alert('Failed to demote admin');
    }
  };

  if (!user?.isSuperAdmin) return <div className="p-8 text-center text-red-600">Super Admin Access Only</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Crown size={28} className="text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
      </div>

      {/* Current Admins */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Current Admins ({admins.length})
        </h2>
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {admin.firstName} {admin.lastName}
                  {admin.isSuperAdmin && <Crown size={16} className="text-yellow-500" title="Super Admin" />}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
              </div>
              {!admin.isSuperAdmin && (
                <button
                  onClick={() => demoteAdmin(admin._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <UserX size={16} />
                  Demote
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Regular Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h2 className="text-lg font-bold mb-4">Promote to Admin</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map(u => (
            <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{u.email} • {u.role}</p>
              </div>
              <button
                onClick={() => promoteToAdmin(u._id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <UserCheck size={16} />
                Promote
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;