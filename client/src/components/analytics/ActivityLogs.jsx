// client/src/components/analytics/ActivityLogs.jsx
import { useState, useEffect } from 'react';
import { Activity, Trash2, Download, Search, Filter, Calendar, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, logId: null, action: '' });

  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, search, filterAction, dateRange]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAdmin 
        ? `${API_URL}/analytics/activity-logs`
        : `${API_URL}/analytics/my-logs`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        showToast('Failed to load activity logs', 'error');
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(searchLower) ||
        log.user?.email?.toLowerCase().includes(searchLower) ||
        log.user?.firstName?.toLowerCase().includes(searchLower) ||
        log.user?.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action?.includes(filterAction));
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
    }

    setFilteredLogs(filtered);
  };

  const handleDeleteLog = (logId) => {
    setConfirmModal({
      isOpen: true,
      logId,
      action: 'delete'
    });
  };

  const handleClearAllLogs = () => {
    setConfirmModal({
      isOpen: true,
      logId: null,
      action: 'clearAll'
    });
  };

  const confirmDelete = async () => {
    const { logId } = confirmModal;

    try {
      const token = localStorage.getItem('token');
      const endpoint = `${API_URL}/analytics/activity-logs/${logId}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('✅ Log deleted successfully', 'success');
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete log', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setConfirmModal({ isOpen: false, logId: null, action: '' });
    }
  };

  const confirmClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAdmin
        ? `${API_URL}/analytics/activity-logs/clear-all`
        : `${API_URL}/analytics/my-logs/clear-all`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Cleared ${data.count} logs`, 'success');
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to clear logs', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setConfirmModal({ isOpen: false, logId: null, action: '' });
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.action === 'delete') {
      confirmDelete();
    } else if (confirmModal.action === 'clearAll') {
      confirmClearAll();
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Action', 'User', 'Email', 'Timestamp', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.action,
        `${log.user?.firstName || ''} ${log.user?.lastName || ''}`,
        log.user?.email || '',
        new Date(log.timestamp).toLocaleString(),
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Logs exported successfully', 'success');
  };

  const getActionColor = (action) => {
    if (action?.includes('APPROVED') || action?.includes('LOGIN')) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (action?.includes('REJECTED') || action?.includes('DELETED')) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (action?.includes('UPDATED') || action?.includes('ADDED')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (action?.includes('SUBMITTED')) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  };

  const actionTypes = [
    'all',
    'USER',
    'RESEARCH',
    'LOGIN',
    'APPROVED',
    'REJECTED',
    'DELETED',
    'UPDATED'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, logId: null, action: '' })}
        onConfirm={handleConfirmAction}
        title={confirmModal.action === 'delete' ? 'Delete Log?' : 'Clear All Logs?'}
        message={
          confirmModal.action === 'delete'
            ? 'Are you sure you want to delete this activity log? This action cannot be undone.'
            : `Are you sure you want to clear all ${filteredLogs.length} activity logs? This action cannot be undone.`
        }
        confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Clear All'}
        type="danger"
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={28} className="text-navy" />
                Activity Logs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isAdmin ? 'All system activity' : 'Your activity history'} ({filteredLogs.length})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchLogs}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50"
              >
                <Download size={16} />
                Export
              </button>
              {(isAdmin || filteredLogs.length > 0) && (
                <button
                  onClick={handleClearAllLogs}
                  disabled={filteredLogs.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm appearance-none cursor-pointer"
              >
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <Activity size={64} className="mx-auto text-gray-400 mb-4 opacity-30" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {search || filterAction !== 'all' || dateRange !== 'all'
                  ? 'No logs match your filters'
                  : 'No activity logs yet'}
              </p>
              {(search || filterAction !== 'all' || dateRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterAction('all');
                    setDateRange('all');
                  }}
                  className="text-navy dark:text-accent hover:underline text-sm font-semibold mt-2"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div
                  key={log._id || index}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Activity size={18} className={getActionColor(log.action).split(' ')[0]} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getActionColor(log.action)}`}>
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                          {log.resource && (
                            <span className="text-xs text-gray-500">
                              → {log.resource}
                            </span>
                          )}
                        </div>
                        
                        {isAdmin && log.user && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <User size={14} />
                            <span className="font-medium">
                              {log.user.firstName} {log.user.lastName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{log.user.email}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          {log.ipAddress && (
                            <>
                              <span>•</span>
                              <span>IP: {log.ipAddress}</span>
                            </>
                          )}
                          {log.details && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-xs">
                                {JSON.stringify(log.details).substring(0, 50)}...
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600"
                      title="Delete log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {filteredLogs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-navy dark:text-accent">{filteredLogs.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Logs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter(l => l.action?.includes('APPROVED') || l.action?.includes('LOGIN')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.action?.includes('REJECTED') || l.action?.includes('DELETED')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(filteredLogs.map(l => l.user?.email)).size}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unique Users</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLogs;