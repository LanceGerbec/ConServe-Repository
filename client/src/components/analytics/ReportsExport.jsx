// client/src/components/analytics/ReportsExport.jsx
import { useState } from 'react';
import { Download, FileDown, FileText, Users, Database, Activity, Calendar } from 'lucide-react';
import Toast from '../common/Toast';

const ReportsExport = ({ dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filters, setFilters] = useState({ role: 'all', status: 'all', category: 'all' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  const exportReport = async (reportId, format) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;
      
      const params = new URLSearchParams({ format, ...filters });
      if (reportId === 'login-trends') params.set('days', dateRange);
      if (reportId === 'weekly-submissions') params.set('weeks', Math.ceil(dateRange / 7));

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
        showToast(`${format.toUpperCase()} exported successfully`);
      } else {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        showToast(err.error, 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'users', title: 'User Directory', desc: 'All users with details', icon: Users, formats: ['CSV', 'Excel', 'PDF'], filters: ['role', 'status'] },
    { id: 'research', title: 'Research Papers', desc: 'All submissions', icon: FileText, formats: ['CSV', 'Excel', 'PDF'], filters: ['status', 'category'] },
    { id: 'activity', title: 'Activity Logs', desc: 'System activity', icon: Database, formats: ['CSV', 'Excel', 'PDF'], filters: [] },
    { id: 'login-trends', title: 'Login Trends', desc: 'Daily login patterns', icon: Activity, formats: ['CSV', 'Excel', 'PDF'], filters: ['role'] },
    { id: 'weekly-submissions', title: 'Weekly Submissions', desc: 'Submission trends', icon: Calendar, formats: ['CSV', 'Excel', 'PDF'], filters: [] }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="text-green-600" size={20} />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Export Reports</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Download in CSV, Excel, or PDF</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})} className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700">
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {reports.map(report => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <report.icon size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {report.formats.map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => exportReport(report.id, fmt.toLowerCase())}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-navy-800 transition"
                    >
                      <FileDown size={14} />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReportsExport;