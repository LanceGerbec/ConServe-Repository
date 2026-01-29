// client/src/components/analytics/ReportsExport.jsx
import { useState } from 'react';
import { Download, FileDown, FileText, Users, Database, Activity, Calendar, Filter, X } from 'lucide-react';
import Toast from '../common/Toast';

const ReportsExport = ({ dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    action: 'all'
  });
  const [showFilters, setShowFilters] = useState({});

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  const exportReport = async (reportId, format) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;
      
      const params = new URLSearchParams({ format });
      
      // Apply filters based on report type
      if (reportId === 'users') {
        if (filters.role !== 'all') params.set('role', filters.role);
        if (filters.status !== 'all') params.set('status', filters.status);
      }
      
      if (reportId === 'research') {
        if (filters.status !== 'all') params.set('status', filters.status);
        if (filters.category !== 'all') params.set('category', filters.category);
      }
      
      if (reportId === 'activity') {
        if (filters.action !== 'all') params.set('action', filters.action);
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
      }
      
      if (reportId === 'login-trends') {
        params.set('days', dateRange);
        if (filters.role !== 'all') params.set('role', filters.role);
      }
      
      if (reportId === 'weekly-submissions') {
        params.set('weeks', Math.ceil(dateRange / 7));
      }

      const res = await fetch(`${API_URL}/reports/${reportId}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'excel' ? 'xlsx' : format;
        a.download = `${reportId}-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`${format.toUpperCase()} exported`);
      } else {
        showToast('Export failed', 'error');
      }
    } catch (error) {
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilters = (reportId) => {
    setShowFilters(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const clearFilters = () => {
    setFilters({ role: 'all', status: 'all', category: 'all', startDate: '', endDate: '', action: 'all' });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all' && v !== '');

  const reports = [
    { 
      id: 'users', 
      title: 'User Directory', 
      desc: 'All users with details', 
      icon: Users, 
      formats: ['CSV', 'Excel', 'PDF'],
      filters: ['role', 'status']
    },
    { 
      id: 'research', 
      title: 'Research Papers', 
      desc: 'All submissions', 
      icon: FileText, 
      formats: ['CSV', 'Excel', 'PDF'],
      filters: ['status', 'category']
    },
    { 
      id: 'activity', 
      title: 'Activity Logs', 
      desc: 'System activity', 
      icon: Database, 
      formats: ['CSV', 'Excel', 'PDF'],
      filters: ['action', 'dateRange']
    },
    { 
      id: 'login-trends', 
      title: 'Login Trends', 
      desc: 'Daily login patterns', 
      icon: Activity, 
      formats: ['CSV', 'Excel', 'PDF'],
      filters: ['role']
    },
    { 
      id: 'weekly-submissions', 
      title: 'Weekly Submissions', 
      desc: 'Submission trends', 
      icon: Calendar, 
      formats: ['CSV', 'Excel', 'PDF'],
      filters: []
    }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="space-y-4">
        {/* Global Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="text-blue-600" size={20} />
              <h3 className="font-bold text-gray-900 dark:text-white">Global Filters</h3>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold">
                <X size={14} /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select 
              value={filters.role} 
              onChange={e => setFilters({...filters, role: e.target.value})} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>
            
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select 
              value={filters.category} 
              onChange={e => setFilters({...filters, category: e.target.value})} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Completed">Completed</option>
              <option value="Published">Published</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input 
                type="date" 
                value={filters.startDate} 
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:border-blue-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input 
                type="date" 
                value={filters.endDate} 
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Report Cards */}
        {reports.map(report => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <report.icon size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.desc}</p>
                </div>
                {report.filters.length > 0 && (
                  <button 
                    onClick={() => toggleFilters(report.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
                  >
                    <Filter size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* Report-Specific Filters */}
              {showFilters[report.id] && report.filters.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Report Filters:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {report.filters.includes('role') && (
                      <select 
                        value={filters.role} 
                        onChange={e => setFilters({...filters, role: e.target.value})}
                        className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    )}
                    
                    {report.filters.includes('status') && (
                      <select 
                        value={filters.status} 
                        onChange={e => setFilters({...filters, status: e.target.value})}
                        className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                    
                    {report.filters.includes('category') && (
                      <select 
                        value={filters.category} 
                        onChange={e => setFilters({...filters, category: e.target.value})}
                        className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Categories</option>
                        <option value="Completed">Completed</option>
                        <option value="Published">Published</option>
                      </select>
                    )}
                    
                    {report.filters.includes('action') && (
                      <select 
                        value={filters.action} 
                        onChange={e => setFilters({...filters, action: e.target.value})}
                        className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Actions</option>
                        <option value="USER">User Actions</option>
                        <option value="RESEARCH">Research Actions</option>
                        <option value="LOGIN">Login/Logout</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="VIOLATION">Violations</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-2">
                {report.formats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => exportReport(report.id, fmt.toLowerCase())}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy-800 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition"
                  >
                    <FileDown size={14} />
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReportsExport;