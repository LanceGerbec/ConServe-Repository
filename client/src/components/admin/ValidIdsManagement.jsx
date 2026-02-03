import { useState, useEffect, useMemo } from 'react';
import { UserCheck, Users, Plus, Search, Trash2, Upload, CheckCircle, X, AlertTriangle, User, RefreshCw, Edit2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import BulkUploadModal from './BulkUploadModal';
import CleanOrphanedModal from './CleanOrphanedModal';
import Toast from '../common/Toast';

const ValidIdsManagement = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [studentIds, setStudentIds] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ id: '', fullName: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => { fetchData(); setCurrentPage(1); }, [activeTab, search]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = search ? `?search=${search}` : '';
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}${params}`, { headers: { Authorization: `Bearer ${token}` } });
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
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids/check-orphaned' : 'valid-faculty-ids/check-orphaned';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setOrphanedCount(data.orphanedCount);
        setShowCleanModal(true);
      }
    } catch (error) {
      showToast('Error checking IDs', 'error');
    }
  };

  const executeCleanOrphaned = async () => {
    setCleaning(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/clean-orphaned`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Cleaned ${data.cleaned} IDs`);
        setShowCleanModal(false);
        fetchData();
      }
    } catch (error) {
      showToast('Error', 'error');
    } finally {
      setCleaning(false);
    }
  };

  const handleBulkDeleteUnused = async () => {
    setBulkDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/bulk-delete-unused`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Deleted ${data.deleted} unused IDs`);
        setShowBulkDeleteModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed', 'error');
      }
    } catch (error) {
      showToast('Error', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.fullName.trim()) return showToast('ID & Name required', 'error');
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const body = activeTab === 'student' ? { studentId: formData.id, fullName: formData.fullName } : { facultyId: formData.id, fullName: formData.fullName };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.fullName.trim()) return showToast('ID & Name required', 'error');
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'student' ? 'valid-student-ids' : 'valid-faculty-ids';
      const body = activeTab === 'student' ? { studentId: formData.id, fullName: formData.fullName, oldId: editTarget.studentId } : { facultyId: formData.id, fullName: formData.fullName, oldId: editTarget.facultyId };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${editTarget._id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        showToast('✅ Updated');
        setShowEditModal(false);
        setEditTarget(null);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${deleteTarget._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
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

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const getSortedData = () => {
    const data = activeTab === 'student' ? studentIds : facultyIds;
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === 'id') {
        aVal = activeTab === 'student' ? a.studentId : a.facultyId;
        bVal = activeTab === 'student' ? b.studentId : b.facultyId;
      } else if (sortConfig.key === 'name') {
        aVal = a.fullName;
        bVal = b.fullName;
      } else if (sortConfig.key === 'date') {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else if (sortConfig.key === 'status') {
        aVal = a.status;
        bVal = b.status;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUp size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const getUnusedCount = () => {
    const data = activeTab === 'student' ? studentIds : facultyIds;
    return data.filter(item => !item.isUsed).length;
  };

  const sortedData = getSortedData();
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const handleItemsPerPageChange = (value) => { setItemsPerPage(value); setCurrentPage(1); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  const Icon = activeTab === 'student' ? UserCheck : Users;
  const idField = activeTab === 'student' ? 'studentId' : 'facultyId';
  const unusedCount = getUnusedCount();

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon size={20} /><span>Valid IDs ({sortedData.length})</span></h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={handleCleanOrphaned} disabled={cleaning} className="flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 text-xs font-bold disabled:opacity-50 flex-1 sm:flex-none justify-center">{cleaning ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}<span>Clean</span></button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-navy text-white px-3 py-2 rounded-lg hover:bg-navy-800 text-xs font-bold flex-1 sm:flex-none justify-center"><Plus size={14} /><span>Add</span></button>
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-xs font-bold flex-1 sm:flex-none justify-center"><Upload size={14} /><span>Bulk</span></button>
            <button onClick={() => setShowBulkDeleteModal(true)} disabled={unusedCount === 0} className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center" title={unusedCount === 0 ? 'No unused IDs' : `Delete ${unusedCount} unused IDs`}><Trash2 size={14} /><span>Del All</span></button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['student', 'faculty'].map(type => (
              <button key={type} onClick={() => { setActiveTab(type); setCurrentPage(1); }} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${activeTab === type ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{type === 'student' ? <UserCheck size={14} className="inline mr-1" /> : <Users size={14} className="inline mr-1" />}{type.charAt(0).toUpperCase() + type.slice(1)} ({type === 'student' ? studentIds.length : facultyIds.length})</button>
            ))}
          </div>
          <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:border-navy focus:outline-none text-xs" /></div>
        </div>

        {sortedData.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border"><Icon size={40} className="mx-auto text-gray-400 mb-3 opacity-30" /><p className="text-sm mb-3 text-gray-600 dark:text-gray-400">No {activeTab} IDs</p><button onClick={() => setShowBulkModal(true)} className="text-navy hover:underline font-bold text-xs">Upload IDs</button></div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
              <div className="block md:hidden divide-y dark:divide-gray-700">
                {paginatedData.map((item) => (
                  <div key={item._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-sm mb-1 text-gray-900 dark:text-white">{item[idField]}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.fullName}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{item.status}</span>
                          {item.isUsed && <CheckCircle size={14} className="text-green-600 dark:text-green-400" />}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { if (item.isUsed) { showToast('Cannot edit used ID', 'warning'); return; } setEditTarget(item); setFormData({ id: item[idField], fullName: item.fullName }); setShowEditModal(true); }} disabled={item.isUsed} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 disabled:opacity-30 transition"><Edit2 size={16} /></button>
                        <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 transition"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                    <tr>
                      <th onClick={() => handleSort('id')} className="px-4 py-2 text-left text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition text-gray-700 dark:text-gray-300"><div className="flex items-center gap-1">{activeTab === 'student' ? 'Student ID' : 'Faculty ID'}<SortIcon columnKey="id" /></div></th>
                      <th onClick={() => handleSort('name')} className="px-4 py-2 text-left text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition text-gray-700 dark:text-gray-300"><div className="flex items-center gap-1">Full Name<SortIcon columnKey="name" /></div></th>
                      <th onClick={() => handleSort('status')} className="px-4 py-2 text-left text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition text-gray-700 dark:text-gray-300"><div className="flex items-center gap-1">Status<SortIcon columnKey="status" /></div></th>
                      <th onClick={() => handleSort('date')} className="px-4 py-2 text-left text-xs font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition text-gray-700 dark:text-gray-300"><div className="flex items-center gap-1">Date Added<SortIcon columnKey="date" /></div></th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Used</th>
                      <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {paginatedData.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                        <td className="px-4 py-3 font-mono font-bold text-xs text-gray-900 dark:text-white">{item[idField]}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{item.fullName}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{item.status}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{item.isUsed ? <CheckCircle size={14} className="text-green-600 dark:text-green-400" /> : <span className="text-gray-400 text-xs">No</span>}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { if (item.isUsed) { showToast('Cannot edit used ID', 'warning'); return; } setEditTarget(item); setFormData({ id: item[idField], fullName: item.fullName }); setShowEditModal(true); }} disabled={item.isUsed} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 disabled:opacity-30 disabled:cursor-not-allowed transition" title={item.isUsed ? 'Cannot edit: Already used' : 'Edit'}><Edit2 size={14} /></button>
                            <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}</span>
                  <div className="relative">
                    <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="px-3 py-1.5 border rounded-lg text-xs font-semibold focus:border-navy focus:outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8 cursor-pointer">
                      <option value={5}>5/page</option>
                      <option value={10}>10/page</option>
                      <option value={20}>20/page</option>
                      <option value={50}>50/page</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => { if (totalPages <= 7) return true; if (page === 1 || page === totalPages) return true; if (page >= currentPage - 1 && page <= currentPage + 1) return true; return false; }).map((page, idx, arr) => { if (idx > 0 && page - arr[idx - 1] > 1) { return [<span key={`dots-${page}`} className="px-2 text-gray-400">...</span>, <button key={page} onClick={() => handlePageChange(page)} className={`min-w-[32px] px-2 py-1 rounded-lg text-xs font-bold transition ${currentPage === page ? 'bg-navy text-white' : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>{page}</button>]; } return <button key={page} onClick={() => handlePageChange(page)} className={`min-w-[32px] px-2 py-1 rounded-lg text-xs font-bold transition ${currentPage === page ? 'bg-navy text-white' : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>{page}</button>; })}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 border dark:border-gray-700"><div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-gray-900 dark:text-white">Add {activeTab === 'student' ? 'Student' : 'Faculty'} ID</h3><button onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"><X size={20} className="text-gray-600 dark:text-gray-400" /></button></div><form onSubmit={handleAdd} className="space-y-3"><input type="text" placeholder="ID *" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" /><input type="text" placeholder="Full Name *" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" /><div className="flex gap-2"><button type="button" onClick={() => { setShowAddModal(false); setFormData({ id: '', fullName: '' }); }} className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-800 transition">Add</button></div></form></div></div>)}

      {showEditModal && editTarget && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 border dark:border-gray-700"><div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-gray-900 dark:text-white">Edit {activeTab === 'student' ? 'Student' : 'Faculty'} ID</h3><button onClick={() => { setShowEditModal(false); setEditTarget(null); setFormData({ id: '', fullName: '' }); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"><X size={20} className="text-gray-600 dark:text-gray-400" /></button></div><form onSubmit={handleEdit} className="space-y-3"><input type="text" placeholder="ID *" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" /><input type="text" placeholder="Full Name *" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" /><div className="flex gap-2"><button type="button" onClick={() => { setShowEditModal(false); setEditTarget(null); setFormData({ id: '', fullName: '' }); }} className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">Update</button></div></form></div></div>)}

      {showDeleteModal && deleteTarget && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border-2 border-red-500"><div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-xl"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><AlertTriangle size={20} className="text-white" /></div><h3 className="text-base font-bold text-white">Delete ID?</h3></div></div><div className="p-4 space-y-3"><div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded"><p className="text-xs font-bold text-red-800 dark:text-red-400 mb-1">⚠️ Deleting:</p><div className="space-y-1 text-xs text-red-700 dark:text-red-300"><div className="font-mono font-bold">{deleteTarget[idField]}</div><div className="flex items-center gap-1"><User size={12} /> {deleteTarget.fullName}</div></div></div>{deleteTarget.isUsed && (<div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded"><p className="text-xs font-bold text-orange-800 dark:text-orange-400">🔗 Currently Used</p></div>)}<div className="flex gap-2"><button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-2 border-2 dark:border-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300">Cancel</button><button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm hover:bg-red-700 transition"><Trash2 size={14} /> Delete</button></div></div></div></div>)}

      {showBulkDeleteModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border-2 border-red-500"><div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-xl"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Trash2 size={20} className="text-white" /></div><h3 className="text-base font-bold text-white">Bulk Delete Unused IDs?</h3></div></div><div className="p-4 space-y-3"><div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded"><p className="text-xs font-bold text-red-800 dark:text-red-400 mb-2">⚠️ WARNING: This will permanently delete:</p><div className="space-y-1 text-xs text-red-700 dark:text-red-300"><div className="flex items-center gap-2"><Trash2 size={14} /><span className="font-bold">{unusedCount} unused {activeTab} IDs</span></div><div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600 dark:text-green-400" /><span>Used IDs will be preserved</span></div></div></div><div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded"><p className="text-xs font-bold text-yellow-800 dark:text-yellow-400">⚡ This action CANNOT be undone!</p></div><div className="flex gap-2"><button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 px-4 py-2 border-2 dark:border-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300">Cancel</button><button onClick={handleBulkDeleteUnused} disabled={bulkDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm disabled:opacity-50 hover:bg-red-700 transition">{bulkDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}{bulkDeleting ? 'Deleting...' : `Delete ${unusedCount}`}</button></div></div></div></div>)}

      {showCleanModal && <CleanOrphanedModal isOpen={showCleanModal} onClose={() => setShowCleanModal(false)} onConfirm={executeCleanOrphaned} type={activeTab} loading={cleaning} orphanedCount={orphanedCount} />}
      {showBulkModal && <BulkUploadModal type={activeTab} onClose={() => setShowBulkModal(false)} onSuccess={() => { fetchData(); setShowBulkModal(false); showToast('✅ Uploaded!'); }} />}
    </>
  );
};

export default ValidIdsManagement;git