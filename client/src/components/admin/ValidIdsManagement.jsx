import { useState, useEffect } from 'react';
import { UserCheck, Users, Plus, Search, Trash2, Upload } from 'lucide-react';
import BulkUploadModal from './BulkUploadModal';
import Toast from '../common/Toast';

const ValidIdsManagement = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [studentIds, setStudentIds] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

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

  const handleDelete = async (id, idNumber) => {
    if (!confirm(`Delete "${idNumber}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('✓ Deleted successfully');
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const currentData = activeTab === 'student' ? studentIds : facultyIds;
  const Icon = activeTab === 'student' ? UserCheck : Users;

  return (
    <>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon size={28} />
              Valid IDs Management
            </h2>
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-lg font-semibold"
            >
              <Upload size={20} />
              Bulk Upload
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'student'
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <UserCheck size={18} className="inline mr-2" />
              Student IDs ({studentIds.length})
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'faculty'
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users size={18} className="inline mr-2" />
              Faculty IDs ({facultyIds.length})
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab} ID or name...`}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800"
          />
        </div>

        {/* TABLE */}
        {currentData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Icon size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No {activeTab} IDs found</p>
            <button
              onClick={() => setShowBulkModal(true)}
              className="text-navy dark:text-accent hover:underline font-semibold"
            >
              Upload IDs to get started
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      {activeTab === 'student' ? 'Student ID' : 'Faculty ID'}
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Full Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Used</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-white">
                        {activeTab === 'student' ? item.studentId : item.facultyId}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.fullName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.isUsed ? (
                          <span className="text-green-600 font-semibold">✓ Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDelete(
                              item._id,
                              activeTab === 'student' ? item.studentId : item.facultyId
                            )
                          }
                          disabled={item.isUsed}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          title={item.isUsed ? 'Cannot delete: Already used' : 'Delete'}
                        >
                          <Trash2 size={18} />
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

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <BulkUploadModal
          type={activeTab}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            fetchData();
            setShowBulkModal(false);
            showToast('✅ Bulk upload completed successfully!');
          }}
        />
      )}
    </>
  );
};

export default ValidIdsManagement;