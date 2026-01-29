import { useState, useEffect } from 'react';
import { Shield, UserPlus, UserMinus, Search, X, AlertTriangle } from 'lucide-react';
import Toast from '../common/Toast';

const API_URL = import.meta.env.VITE_API_URL;

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [adminsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin-management`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      
      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data.admins || []);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAllUsers(data.users || []);
      }
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin-management/promote/${selectedUser._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        showToast('✅ User promoted to admin');
        setShowPromoteModal(false);
        setSelectedUser(null);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to promote', 'error');
      }
    } catch (error) {
      showToast('Error promoting user', 'error');
    }
  };

  const handleDemote = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin-management/demote/${selectedUser._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoteTo: 'student' })
      });
      
      if (res.ok) {
        showToast('✅ Admin demoted');
        setShowDemoteModal(false);
        setSelectedUser(null);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to demote', 'error');
      }
    } catch (error) {
      showToast('Error demoting admin', 'error');
    }
  };

  const filteredAdmins = admins.filter(a => 
    search ? (
      a.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      a.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
    ) : true
  );

  const filteredUsers = allUsers.filter(u => 
    search ? (
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ) : true
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield size={20} className="text-red-600" />
              Manage Admins ({filteredAdmins.length})
            </h2>
            <button 
              onClick={() => setShowPromoteModal(true)} 
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-navy-800"
            >
              <UserPlus size={16} />
              Promote User
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search admins..." 
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" 
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={18} />
              </button>
            )}
          </div>

          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No admins found</div>
          ) : (
            <div className="space-y-2">
              {filteredAdmins.map(admin => (
                <div key={admin._id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{admin.firstName} {admin.lastName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{admin.email}</p>
                    {admin.isSuperAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        Super Admin
                      </span>
                    )}
                  </div>
                  {!admin.isSuperAdmin && (
                    <button 
                      onClick={() => { setSelectedUser(admin); setShowDemoteModal(true); }}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                      title="Demote to regular user"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PROMOTE MODAL */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Promote User to Admin</h3>
              <button onClick={() => { setShowPromoteModal(false); setSelectedUser(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search users..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" 
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No users found</div>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user._id}
                    onClick={() => { setSelectedUser(user); handlePromote(); }}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {user.role}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEMOTE MODAL */}
      {showDemoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border-2 border-orange-500">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-white">Demote Admin?</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <p className="text-xs font-bold text-orange-800 mb-2">⚠️ Demoting:</p>
                <p className="font-bold text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-gray-600">{selectedUser.email}</p>
              </div>
              <p className="text-xs text-gray-600">This user will be converted to a regular student account.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowDemoteModal(false); setSelectedUser(null); }} 
                  className="flex-1 px-4 py-2 border-2 rounded-lg font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDemote}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm"
                >
                  <UserMinus size={14} /> Demote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminManagement;