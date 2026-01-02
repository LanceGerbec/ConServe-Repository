import { useState, useEffect } from 'react';
import { UserCheck, Users, Plus, Search, Trash2, Upload, CheckCircle, X, AlertTriangle, User, RefreshCw } from 'lucide-react';
import BulkUploadModal from './BulkUploadModal';
import Toast from '../common/Toast';

const ValidIdsManagement = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [studentIds, setStudentIds] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
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
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanOrphaned = async () => {
    if (!confirm(`Clean orphaned ${activeTab} IDs?`)) return;
    setCleaning(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/clean-orphaned`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Cleaned ${data.cleaned} IDs`);
        fetchData();
      }
    } catch (error) {
      showToast('Error', 'error');
    } finally {
      setCleaning(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.fullName.trim()) {
      showToast('ID & Name required', 'error');
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
        showToast('✅ Added');
        setShowAddModal(false);
        setFormData({ id: '', fullName: '' });
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed', 'error');
      }
    } catch (error) {
      showToast('Error', 'error');
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
        showToast('✅ Deleted');
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed', 'error');
      }
    } catch (error) {
      showToast('Error', 'error');
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

      <div className="space-y-3">
        {/* COMPACT HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon size={20} className="flex-shrink-0" />
              <span className="truncate">Valid IDs ({currentData.length})</span>
            </h2>
          </div>

          {/* ACTION BUTTONS - MOBILE OPTIMIZED */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button onClick={handleCleanOrphaned} disabled={cleaning} className="flex flex-col items-center gap-1 bg-orange-600 text-white px-2 py-2 rounded-lg hover:bg-orange-700 text-xs font-bold disabled:opacity-50 transition">
              {cleaning ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              <span className="hidden sm:inline">Clean</span>
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex flex-col items-center gap-1 bg-navy text-white px-2 py-2 rounded-lg hover:bg-navy-800 text-xs font-bold transition">
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
            <button onClick={() => setShowBulkModal(true)} className="flex flex-col items-center gap-1 bg-green-600 text-white px-2 py-2 rounded-lg hover:bg-green-700 text-xs font-bold transition">
              <Upload size={16} />
              <span className="hidden sm:inline">Bulk</span>
            </button>
          </div>

          {/* TABS - MOBILE OPTIMIZED */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['student', 'faculty'].map(type => (
              <button key={type} onClick={() => setActiveTab(type)} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${activeTab === type ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {type === 'student' ? <UserCheck size={14} className="inline mr-1" /> : <Users size={14} className="inline mr-1" />}
                {type.charAt(0).toUpperCase() + type.slice(1)} ({type === 'student' ? studentIds.length : facultyIds.length})
              </button>
            ))}
          </div>

          {/* SEARCH - COMPACT */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-xs" />
          </div>
        </div>

        {/* DATA DISPLAY - COMPACT CARDS */}
        {currentData.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Icon size={40} className="mx-auto text-gray-400 mb-3 opacity-30" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">No {activeTab} IDs</p>
            <button onClick={() => setShowBulkModal(true)} className="text-navy dark:text-accent hover:underline font-bold text-xs">Upload IDs</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* MOBILE: CARD VIEW */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.map((item) => (
                <div key={item._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-sm text-gray-900 dark:text-white mb-1">{item[idField]}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.fullName}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                        {item.isUsed && <CheckCircle size={14} className="text-green-600" />}
                      </div>
                    </div>
                    <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-700 p-1.5 flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP: TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold">{activeTab === 'student' ? 'Student ID' : 'Faculty ID'}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold">Full Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-bold">Used</th>
                    <th className="px-4 py-2 text-right text-xs font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-3 font-mono font-bold text-xs">{item[idField]}</td>
                      <td className="px-4 py-3 text-xs">{item.fullName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.isUsed ? <CheckCircle size={14} className="text-green-600" /> : <span className="text-gray-400 text-xs">No</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-700 p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD MODAL - COMPACT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold">Add {activeTab === 'student' ? 'Student' : 'Faculty'} ID</h3>
              <button onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" placeholder="ID *" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" />
              <input type="text" placeholder="Full Name *" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-navy focus:outline-none text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="flex-1 px-4 py-2 border rounded-lg text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL - COMPACT */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border-2 border-red-500">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-white">Delete ID?</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-xs font-bold text-red-800 mb-1">⚠️ Deleting:</p>
                <div className="space-y-1 text-xs text-red-700">
                  <div className="font-mono font-bold">{deleteTarget[idField]}</div>
                  <div className="flex items-center gap-1"><User size={12} /> {deleteTarget.fullName}</div>
                </div>
              </div>
              {deleteTarget.isUsed && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                  <p className="text-xs font-bold text-orange-800">🔗 Currently Used</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-2 border-2 rounded-lg font-bold text-sm">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && <BulkUploadModal type={activeTab} onClose={() => setShowBulkModal(false)} onSuccess={() => { fetchData(); setShowBulkModal(false); showToast('✅ Uploaded!'); }} />}
    </>
  );
};

export default ValidIdsManagement;