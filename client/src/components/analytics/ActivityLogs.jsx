import { useState, useEffect } from 'react';
import { Activity, Trash2, Download, Search, Filter, Calendar, User, RefreshCw, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

// 🆕 VIOLATION STATISTICS COMPONENT
const ViolationStats = ({ logs }) => {
  const violations = logs.filter(l => l.action === 'PDF_PROTECTION_VIOLATION');
  const today = violations.filter(v => {
    const logDate = new Date(v.timestamp).toDateString();
    return logDate === new Date().toDateString();
  });
  
  const byType = {};
  violations.forEach(v => {
    const type = v.details?.violationType || 'Unknown';
    byType[type] = (byType[type] || 0) + 1;
  });
  
  const critical = violations.filter(v => v.details?.severity === 'critical').length;
  const uniqueUsers = new Set(violations.map(v => v.user?.email)).size;
  
  if (violations.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl shadow-sm border-2 border-red-300 dark:border-red-700 p-4 mb-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={20} className="text-red-600 dark:text-red-400" />
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          🚨 Security Violations Dashboard
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-400 dark:border-red-600 shadow-sm">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{today.length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Today</div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-400 dark:border-orange-600 shadow-sm">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{violations.length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total</div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-400 dark:border-purple-600 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{critical}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Critical</div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-400 dark:border-blue-600 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{uniqueUsers}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Users</div>
        </div>
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Activity size={12} />
            Violation Types:
          </p>
          <div className="space-y-1.5">
            {Object.entries(byType)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{type}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, logId: null, action: '' });

  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchLogs(); }, []);
  
  // 🆕 AUTO-REFRESH EVERY 10 SECONDS (ADMIN ONLY)
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing logs...');
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => { applyFilters(); }, [logs, search, filterAction, dateRange]);

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAdmin ? `${API_URL}/analytics/activity-logs` : `${API_URL}/analytics/my-logs`;
      const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else showToast('Failed to load logs', 'error');
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(s) ||
        log.user?.email?.toLowerCase().includes(s) ||
        log.user?.firstName?.toLowerCase().includes(s) ||
        log.user?.lastName?.toLowerCase().includes(s)
      );
    }
    if (filterAction !== 'all') filtered = filtered.filter(log => log.action?.includes(filterAction));
    if (dateRange !== 'all') {
      const cutoff = new Date();
      if (dateRange === 'today') cutoff.setHours(0,0,0,0);
      else if (dateRange === 'week') cutoff.setDate(cutoff.getDate() - 7);
      else if (dateRange === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
    }
    setFilteredLogs(filtered);
  };

  const handleDeleteLog = (logId) => setConfirmModal({ isOpen: true, logId, action: 'delete' });
  const handleClearAll = () => setConfirmModal({ isOpen: true, logId: null, action: 'clearAll' });

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/analytics/activity-logs/${confirmModal.logId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('✅ Log deleted');
        fetchLogs();
      } else showToast('Failed to delete', 'error');
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setConfirmModal({ isOpen: false, logId: null, action: '' });
    }
  };

  const confirmClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAdmin ? `${API_URL}/analytics/activity-logs/clear-all` : `${API_URL}/analytics/my-logs/clear-all`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Cleared ${data.count} logs`);
        fetchLogs();
      } else showToast('Failed to clear', 'error');
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setConfirmModal({ isOpen: false, logId: null, action: '' });
    }
  };

  const handleConfirm = () => {
    if (confirmModal.action === 'delete') confirmDelete();
    else if (confirmModal.action === 'clearAll') confirmClearAll();
  };

  const exportLogs = () => {
    const csv = [
      ['Action', 'User', 'Email', 'Timestamp', 'IP', 'Details'].join(','),
      ...filteredLogs.map(l => [
        l.action,
        `${l.user?.firstName || ''} ${l.user?.lastName || ''}`,
        l.user?.email || '',
        new Date(l.timestamp).toLocaleString(),
        l.ipAddress || '',
        l.details?.violationType || ''
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Exported');
  };

  const getActionColor = (action) => {
    if (action === 'PDF_PROTECTION_VIOLATION') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 animate-pulse';
    if (action?.includes('VIOLATION')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600';
    if (action?.includes('APPROVED') || action?.includes('LOGIN')) return 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
    if (action?.includes('REJECTED') || action?.includes('DELETED')) return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
    if (action?.includes('UPDATED') || action?.includes('ADDED')) return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
    if (action?.includes('SUBMITTED')) return 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  };

  const actionTypes = ['all', 'USER', 'RESEARCH', 'LOGIN', 'APPROVED', 'REJECTED', 'DELETED', 'UPDATED', 'VIOLATION', 'PDF_PROTECTION_VIOLATION'];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-blue-500"></div>
    </div>
  );

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({...toast, show: false})} />}
      
      {/* 🆕 VIOLATION STATISTICS (ADMIN ONLY) */}
      {isAdmin && <ViolationStats logs={filteredLogs} />}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, logId: null, action: '' })}
        onConfirm={handleConfirm}
        title={confirmModal.action === 'delete' ? 'Delete Log?' : 'Clear All Logs?'}
        message={confirmModal.action === 'delete' ? 'Delete this activity log?' : `Clear all ${filteredLogs.length} logs?`}
        confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Clear All'}
        type="danger"
      />

      <div className="space-y-4 pb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity size={24} className="text-navy dark:text-blue-500 flex-shrink-0" />
                <span className="truncate">Activity Logs</span>
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {isAdmin ? 'System' : 'Your'} activity ({filteredLogs.length})
              </p>
            </div>
            <button onClick={fetchLogs} className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition flex-shrink-0">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition text-gray-900 dark:text-gray-100"
            >
              <Filter size={16} />
              Filters {showFilters ? '▲' : '▼'}
            </button>
            <button
              onClick={exportLogs}
              disabled={filteredLogs.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition text-sm font-semibold disabled:opacity-50 flex-shrink-0"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleClearAll}
              disabled={filteredLogs.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition text-sm font-semibold disabled:opacity-50 flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                {actionTypes.map(a => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>)}
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
              {(search || filterAction !== 'all' || dateRange !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilterAction('all'); setDateRange('all'); }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <X size={16} />Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Activity size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-3 opacity-30" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">No logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log, i) => (
                <div key={log._id || i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-start gap-3">
                    {log.action === 'PDF_PROTECTION_VIOLATION' ? (
                      <Shield size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Activity size={16} className={`${getActionColor(log.action).split(' ')[0]} flex-shrink-0 mt-0.5`} />
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)} break-words`}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      
                      {log.action === 'PDF_PROTECTION_VIOLATION' && log.details && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500 dark:border-red-600 shadow-sm">
                          <div className="flex items-start gap-2 mb-1.5">
                            <Shield size={14} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-1">
                                {log.details.violationType}
                              </p>
                              {log.details.researchTitle && (
                                <p className="text-xs text-gray-700 dark:text-gray-400 truncate">
                                  📄 {log.details.researchTitle}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {log.details.severity && (
                                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                    log.details.severity === 'critical' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-orange-500 text-white'
                                  }`}>
                                    {log.details.severity.toUpperCase()}
                                  </span>
                                )}
                                {log.details.attemptCount > 1 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-bold">
                                    {log.details.attemptCount} attempts
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isAdmin && log.user && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <User size={12} className="flex-shrink-0" />
                          <span className="truncate">{log.user.firstName} {log.user.lastName}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                        </span>
                        {log.ipAddress && <span className="whitespace-nowrap font-mono">IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition text-red-600 dark:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredLogs.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="text-xl font-bold text-navy dark:text-blue-400">{filteredLogs.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{filteredLogs.filter(l => l.action?.includes('APPROVED')).length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{filteredLogs.filter(l => l.action?.includes('VIOLATION')).length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Violations</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{new Set(filteredLogs.map(l => l.user?.email)).size}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Users</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLogs;