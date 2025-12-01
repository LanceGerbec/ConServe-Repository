import { useState, useEffect } from 'react';
import { Activity, User, FileText, Calendar } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/activity-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  const getActionColor = (action) => {
    if (action.includes('APPROVED')) return 'text-green-600';
    if (action.includes('REJECTED')) return 'text-red-600';
    if (action.includes('LOGIN')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            <div className="flex items-start gap-3">
              <Activity size={18} className={getActionColor(log.action)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  By: {log.user?.firstName} {log.user?.lastName} ({log.user?.email})
                </p>
                <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogs;