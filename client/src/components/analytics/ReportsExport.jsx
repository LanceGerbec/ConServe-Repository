// client/src/components/analytics/ReportsExport.jsx - ENHANCED VERSION
import { useState } from 'react';
import { Download, FileDown, FileText, Users, Database, Filter, CheckCircle, TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';
import Toast from '../common/Toast';

const ReportsExport = ({ dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedReport, setSelectedReport] = useState('');
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    role: 'all',
    category: 'all',
    format: 'csv'
  });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  // 🆕 ORGANIZED REPORT CATEGORIES
  const reportCategories = [
    {
      id: 'core',
      title: 'Core Reports',
      description: 'Essential system data exports',
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      reports: [
        {
          id: 'users',
          title: 'User Directory',
          description: 'Complete list of all users with details',
          icon: Users,
          formats: ['CSV', 'Excel', 'PDF'],
          filters: ['role', 'status']
        },
        {
          id: 'research',
          title: 'Research Papers',
          description: 'All research submissions and metadata',
          icon: FileText,
          formats: ['CSV', 'Excel', 'PDF'],
          filters: ['status', 'category']
        },
        {
          id: 'activity',
          title: 'Activity Logs',
          description: 'System activity and audit trail',
          icon: Database,
          formats: ['CSV', 'Excel'],
          filters: ['dateRange']
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Reports',
      description: 'Insights and trend analysis',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      reports: [
        {
          id: 'login-trends',
          title: 'Login Activity Trends',
          description: 'Daily login/logout patterns with peak hours',
          icon: TrendingUp,
          formats: ['CSV', 'Excel', 'PDF'],
          filters: ['dateRange', 'role']
        },
        {
          id: 'weekly-submissions',
          title: 'Weekly Submission Analysis',
          description: 'Research submission trends by week',
          icon: Calendar,
          formats: ['CSV', 'Excel', 'PDF'],
          filters: ['dateRange']
        },
        {
          id: 'comprehensive',
          title: 'Comprehensive Dashboard',
          description: 'Complete analytics overview with all metrics',
          icon: BarChart3,
          formats: ['PDF'],
          filters: ['dateRange']
        }
      ]
    },
    {
      id: 'custom',
      title: 'Custom Reports',
      description: 'Build your own report',
      icon: Filter,
      color: 'from-orange-500 to-orange-600',
      reports: [
        {
          id: 'custom-builder',
          title: 'Custom Report Builder',
          description: 'Select specific data fields and filters',
          icon: Filter,
          formats: ['CSV', 'Excel', 'PDF'],
          filters: ['all']
        }
      ]
    }
  ];

  const exportReport = async (reportId, format) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Build query parameters
      const params = new URLSearchParams({
        format: format.toLowerCase(),
        range: dateRange,
        ...reportFilters
      });

      const res = await fetch(`${API_URL}/reports/${reportId}?${params}`, {
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
        showToast(`✅ ${reportId} report exported as ${format}`);
      } else {
        showToast('Export failed', 'error');
      }
    } catch (error) {
      showToast('Export error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const FilterSection = ({ reportId, availableFilters }) => {
    if (!availableFilters || availableFilters.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Report Filters:</p>
        
        {availableFilters.includes('role') && (
          <select
            value={reportFilters.role}
            onChange={(e) => setReportFilters({ ...reportFilters, role: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
          >
            <option value="all">All Roles</option>
            <option value="student">Students Only</option>
            <option value="faculty">Faculty Only</option>
            <option value="admin">Admins Only</option>
          </select>
        )}

        {availableFilters.includes('status') && (
          <select
            value={reportFilters.status}
            onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        )}

        {availableFilters.includes('category') && (
          <select
            value={reportFilters.category}
            onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="Completed">Completed</option>
            <option value="Published">Published</option>
          </select>
        )}
      </div>
    );
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Download comprehensive data in multiple formats</p>
            </div>
          </div>

          {/* Global Date Range Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Current Date Range: <span className="text-blue-600">Last {dateRange} days</span>
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Change date range in the Analytics Hub header to update all reports
            </p>
          </div>
        </div>

        {/* Report Categories */}
        {reportCategories.map(category => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <CategoryIcon className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{category.title}</h4>
                    <p className="text-xs text-white/90">{category.description}</p>
                  </div>
                </div>
              </div>

              {/* Reports in Category */}
              <div className="p-4 space-y-4">
                {category.reports.map(report => {
                  const ReportIcon = report.icon;
                  const isExpanded = selectedReport === report.id;

                  return (
                    <div key={report.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:border-navy dark:hover:border-accent">
                      {/* Report Header */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ReportIcon size={20} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 dark:text-white mb-1">{report.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                            
                            {/* Export Buttons */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {report.formats.map(format => (
                                <button
                                  key={format}
                                  onClick={() => exportReport(report.id, format)}
                                  disabled={loading}
                                  className="flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy-800 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 shadow-md active:scale-95"
                                >
                                  <FileDown size={14} />
                                  {format}
                                </button>
                              ))}
                              
                              {report.filters && report.filters.length > 0 && (
                                <button
                                  onClick={() => setSelectedReport(isExpanded ? '' : report.id)}
                                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <Filter size={14} />
                                  {isExpanded ? 'Hide' : 'Show'} Filters
                                </button>
                              )}
                            </div>

                            {/* Expandable Filters */}
                            {isExpanded && (
                              <FilterSection reportId={report.id} availableFilters={report.filters} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick Export Actions */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={24} />
            <div>
              <h4 className="text-lg font-bold">Quick Export Actions</h4>
              <p className="text-sm text-white/90">Common report combinations for fast access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => exportReport('users', 'CSV')}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition text-center"
            >
              <Users size={20} />
              <span className="text-sm font-semibold">All Users (CSV)</span>
            </button>

            <button
              onClick={() => exportReport('research', 'PDF')}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition text-center"
            >
              <FileText size={20} />
              <span className="text-sm font-semibold">Research Papers (PDF)</span>
            </button>

            <button
              onClick={() => exportReport('comprehensive', 'PDF')}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition text-center"
            >
              <BarChart3 size={20} />
              <span className="text-sm font-semibold">Full Analytics (PDF)</span>
            </button>
          </div>
        </div>

        {/* Export Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Export Tips</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>CSV:</strong> Best for data analysis in Excel/Google Sheets</li>
                <li>• <strong>Excel:</strong> Formatted with headers and styling</li>
                <li>• <strong>PDF:</strong> Print-ready reports with charts and summaries</li>
                <li>• Use filters to narrow down data before exporting</li>
                <li>• Large exports may take a few seconds to generate</li>
                <li>• All timestamps are in your local timezone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Privacy Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-l-4 border-yellow-500 p-4">
          <div className="flex items-start gap-3">
            <Filter className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Data Privacy Notice</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Exported reports may contain sensitive information. Handle with care and follow your institution's data protection policies. Never share reports containing user data publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsExport;