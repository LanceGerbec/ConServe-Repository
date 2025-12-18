import { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Trash2, X, CheckCircle } from 'lucide-react';

const ValidStudentIdsManagement = () => {
  const [studentIds, setStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentId: '', fullName: '', course: '', yearLevel: '', email: ''
  });

  useEffect(() => {
    fetchStudentIds();
  }, [search]);

  const fetchStudentIds = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = search ? `?search=${search}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-student-ids${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStudentIds(data.validIds || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load student IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.studentId.trim() || !formData.fullName.trim()) {
      setError('Student ID and Full Name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-student-ids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ studentId: '', fullName: '', course: '', yearLevel: '', email: '' });
        setError('');
        fetchStudentIds();
      } else {
        setError(data.error || 'Failed to add student ID');
      }
    } catch (error) {
      console.error('Add error:', error);
      setError('Connection error. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student ID?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-student-ids/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchStudentIds();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete student ID');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserCheck size={28} />
          Valid Student IDs ({studentIds.length})
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl hover:bg-navy-800 transition"
        >
          <Plus size={18} />
          Add Student ID
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student ID or name..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800"
        />
      </div>

      {studentIds.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <UserCheck size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No student IDs found</p>
          <p className="text-sm text-gray-500 mt-2">Add student IDs to allow registration</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Used</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {studentIds.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.studentId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.course || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.yearLevel || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isUsed ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={item.isUsed}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Student ID</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Student ID*"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Full Name*"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Course (Optional)"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Year Level (Optional)"
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <button
                type="submit"
                className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold"
              >
                Add Student ID
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidStudentIdsManagement;