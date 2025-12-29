import { useState, useEffect } from 'react';
import { UserCheck, Users, Plus, Search, Trash2, Upload, CheckCircle, X, AlertTriangle, User } from 'lucide-react';
import BulkUploadModal from './BulkUploadModal';
import Toast from '../common/Toast';

const ValidIdsManagement = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [studentIds, setStudentIds] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ id: '', fullName: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => { fetchData(); }, [activeTab, search]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = search ? `?search=${search}` : '';
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        activeTab === 'student' ? setStudentIds(data.validIds || []) : setFacultyIds(data.validIds || []);
      }
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.fullName.trim()) {
      showToast('ID and Full Name required', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const body = activeTab === 'student' 
        ? { studentId: formData.id, fullName: formData.fullName }
        : { facultyId: formData.id, fullName: formData.fullName };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showToast('✅ ID added successfully');
        setShowAddModal(false);
        setFormData({ id: '', fullName: '' });
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to add', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('✅ ID deleted successfully');
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );

  const currentData = activeTab === 'student' ? studentIds : facultyIds;
  const Icon = activeTab === 'student' ? UserCheck : Users;
  const idField = activeTab === 'student' ? 'studentId' : 'facultyId';

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon size={24} /> Valid IDs
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-800 text-sm font-semibold">
                <Plus size={18} /> Add
              </button>
              <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold">
                <Upload size={18} /> Bulk
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {['student', 'faculty'].map(type => (
              <button key={type} onClick={() => setActiveTab(type)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === type ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {type === 'student' ? <UserCheck size={16} className="inline mr-2" /> : <Users size={16} className="inline mr-2" />}
                {type.charAt(0).toUpperCase() + type.slice(1)} ({type === 'student' ? studentIds.length : facultyIds.length})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab} ID or name...`} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-sm" />
          </div>
        </div>

        {currentData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Icon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No {activeTab} IDs found</p>
            <button onClick={() => setShowBulkModal(true)} className="text-navy dark:text-accent hover:underline font-semibold text-sm">Upload IDs</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{activeTab === 'student' ? 'Student ID' : 'Faculty ID'}</th>
                  <th className="px-4 py-3 text-left font-semibold">Full Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Used</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-mono font-semibold">{item[idField]}</td>
                    <td className="px-4 py-3">{item.fullName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.isUsed ? <CheckCircle size={16} className="text-green-600" /> : <span className="text-gray-400 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add {activeTab === 'student' ? 'Student' : 'Faculty'} ID</h3>
              <button onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder={`${activeTab === 'student' ? 'Student' : 'Faculty'} ID *`} required value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full px-4 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" />
              <input type="text" placeholder="Full Name *" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-800">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full border-2 border-red-500">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete ID?</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ Deleting:</p>
                <div className="space-y-2 text-sm text-red-700 dark:text-red-400">
                  <div className="font-mono font-bold">{deleteTarget[idField]}</div>
                  <div className="flex items-center gap-2"><User size={14} /> {deleteTarget.fullName}</div>
                </div>
              </div>

              {deleteTarget.isUsed && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">🔗 Currently Used</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-3 border-2 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <BulkUploadModal type={activeTab} onClose={() => setShowBulkModal(false)} onSuccess={() => { fetchData(); setShowBulkModal(false); showToast('✅ Bulk upload completed!'); }} />
      )}
    </>
  );
};

export default ValidIdsManagement;