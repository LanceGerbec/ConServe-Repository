import { useState, useEffect } from 'react';
import { UserCheck, Users, Plus, Search, Trash2, X, CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';

const ValidIdsManagement = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [studentIds, setStudentIds] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [formData, setFormData] = useState({
    studentId: '', facultyId: '', fullName: '', course: '', department: '', yearLevel: '', position: '', email: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = search ? `?search=${search}` : '';
      
      if (activeTab === 'student') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-student-ids${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudentIds(data.validIds || []);
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-faculty-ids${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFacultyIds(data.validIds || []);
        }
      }
      setError('');
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const isStudent = activeTab === 'student';
    const idField = isStudent ? 'studentId' : 'facultyId';
    
    if (!formData[idField].trim() || !formData.fullName.trim()) {
      setError('ID and Full Name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = isStudent ? 'valid-student-ids' : 'valid-faculty-ids';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`✓ ${isStudent ? 'Student' : 'Faculty'} ID added successfully!`);
        setShowAddModal(false);
        setFormData({ studentId: '', facultyId: '', fullName: '', course: '', department: '', yearLevel: '', position: '', email: '' });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add');
      }
    } catch (error) {
      setError('Connection error');
    }
  };

  const handleBulkUpload = async () => {
    setError('');
    setSuccess('');
    
    if (!bulkText.trim()) {
      setError('Please paste your data');
      return;
    }

    try {
      const lines = bulkText.trim().split('\n');
      const ids = [];
      
      for (const line of lines) {
        const [id, name] = line.split(',').map(s => s.trim());
        if (id && name) {
          if (activeTab === 'student') {
            ids.push({ studentId: id, fullName: name });
          } else {
            ids.push({ facultyId: id, fullName: name });
          }
        }
      }

      if (ids.length === 0) {
        setError('No valid data found. Format: ID,Name (one per line)');
        return;
      }

      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'students' : 'faculty';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bulk-upload/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`✓ Added: ${data.results.added} | Skipped: ${data.results.skipped} | Errors: ${data.results.errors.length}`);
        setShowBulkModal(false);
        setBulkText('');
        fetchData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Bulk upload failed');
      }
    } catch (error) {
      setError('Bulk upload failed');
    }
  };

  const handleDelete = async (id, idNumber) => {
    if (!confirm(`Delete "${idNumber}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess('✓ Deleted successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete');
      }
    } catch (error) {
      setError('Failed to delete');
    }
  };

  const downloadTemplate = () => {
    const template = activeTab === 'student' 
      ? 'STUDENT_ID,FULL_NAME\n2021-12345,Juan Dela Cruz\n2021-67890,Maria Santos'
      : 'FACULTY_ID,FULL_NAME\nFAC-001,Dr. John Doe\nFAC-002,Prof. Jane Smith';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_id_template.csv`;
    a.click();
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
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon size={28} />
            Valid IDs Management
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
              <Upload size={18} />
              Bulk Upload
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl hover:bg-navy-800 transition">
              <Plus size={18} />
              Add Single
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('student')} className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'student' ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <UserCheck size={18} className="inline mr-2" />
            Student IDs ({studentIds.length})
          </button>
          <button onClick={() => setActiveTab('faculty')} className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'faculty' ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Users size={18} className="inline mr-2" />
            Faculty IDs ({facultyIds.length})
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Table */}
      {currentData.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Icon size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No {activeTab} IDs found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{activeTab === 'student' ? 'Student ID' : 'Faculty ID'}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{activeTab === 'student' ? 'Course' : 'Department'}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{activeTab === 'student' ? 'Year' : 'Position'}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Used</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{activeTab === 'student' ? item.studentId : item.facultyId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{activeTab === 'student' ? (item.course || '-') : (item.department || '-')}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{activeTab === 'student' ? (item.yearLevel || '-') : (item.position || '-')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4">{item.isUsed ? <CheckCircle className="text-green-500" size={18} /> : <span className="text-gray-400 text-sm">No</span>}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(item._id, activeTab === 'student' ? item.studentId : item.facultyId)} disabled={item.isUsed} className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" title={item.isUsed ? 'Cannot delete: Already used' : 'Delete'}>
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

      {/* Add Single Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add {activeTab === 'student' ? 'Student' : 'Faculty'} ID</h3>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
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
                placeholder={`${activeTab === 'student' ? 'Student' : 'Faculty'} ID*`}
                required
                value={activeTab === 'student' ? formData.studentId : formData.facultyId}
                onChange={(e) => setFormData({ ...formData, [activeTab === 'student' ? 'studentId' : 'facultyId']: e.target.value.toUpperCase() })}
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
              
              {activeTab === 'student' ? (
                <>
                  <input type="text" placeholder="Course (Optional)" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="Year Level (Optional)" value={formData.yearLevel} onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Department (Optional)" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="Position (Optional)" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </>
              )}
              
              <input type="email" placeholder="Email (Optional)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <button type="submit" className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold">
                Add {activeTab === 'student' ? 'Student' : 'Faculty'} ID
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload {activeTab === 'student' ? 'Student' : 'Faculty'} IDs</h3>
              <button onClick={() => { setShowBulkModal(false); setBulkText(''); setError(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><strong>Format:</strong> ID,FullName (one per line)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Example:</p>
                <code className="block bg-white dark:bg-gray-900 p-2 rounded mt-2 text-xs">
                  {activeTab === 'student' ? '2021-12345,Juan Dela Cruz\n2021-67890,Maria Santos' : 'FAC-001,Dr. John Doe\nFAC-002,Prof. Jane Smith'}
                </code>
              </div>

              <textarea
                rows={10}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Paste your ${activeTab} IDs here...\nFormat: ID,FullName (one per line)`}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />

              <div className="flex gap-3">
                <button onClick={downloadTemplate} className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <Download size={18} />
                  Download Template
                </button>
                <button onClick={handleBulkUpload} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold">
                  <Upload size={18} className="inline mr-2" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidIdsManagement;