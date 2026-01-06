// client/src/components/analytics/ReportsExport.jsx
import { useState } from 'react';
import { Download, FileDown, FileText, Users, Database, Filter, CheckCircle } from 'lucide-react';
import Toast from '../common/Toast';

const ReportsExport = ({ dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedReport, setSelectedReport] = useState('');

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const reports = [
    {
      id: 'users',
      title: 'User List Export',
      description: 'Export all users with details',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      formats: ['CSV', 'Excel']
    },
    {
      id: 'research',
      title: 'Research Papers Export',
      description: 'Export all research papers',
      icon: FileText,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      formats: ['CSV', 'Excel', 'PDF']
    },
    {
      id: 'activity',
      title: 'Activity Logs Export',
      description: 'Export system activity logs',
      icon: Database,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      formats: ['CSV']
    },
    {
      id: 'summary',
      title: 'Monthly Summary Report',
      description: 'Comprehensive monthly statistics',
      icon: FileDown,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
      formats: ['PDF']
    }
  ];

  const exportReport = async (reportId, format) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/export/${reportId}?format=${format}&range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast(`Report exported successfully as ${format}`);
      } else {
        showToast('Export failed', 'error');
      }
    } catch (error) {
      showToast('Export error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download data in various formats</p>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map(report => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{report.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {report.formats.map(format => (
                    <button
                      key={format}
                      onClick={() => exportReport(report.id, format)}
                      disabled={loading}
                      className="flex-1 min-w-[100px] px-4 py-2.5 bg-navy hover:bg-navy-800 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <FileDown size={16} />
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Report Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Filter className="text-indigo-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Custom Report Builder</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create custom reports with specific filters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">Choose report type...</option>
                <option value="users">Users Report</option>
                <option value="research">Research Report</option>
                <option value="activity">Activity Report</option>
              </select>
            </div>

            {selectedReport && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Report Selected</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Additional filters and customization options will be available in the next update.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsExport;