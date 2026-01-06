// client/src/components/analytics/AnalyticsHub.jsx
import { useState } from 'react';
import { BarChart3, TrendingUp, FileText, Activity, Calendar, ChevronDown } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import TrendAnalysis from './TrendAnalysis';
import ReportsExport from './ReportsExport';
import ActivityLogs from './ActivityLogs';

const AnalyticsHub = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive system insights</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm font-semibold appearance-none cursor-pointer"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-navy text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeSubTab === 'overview' && <AnalyticsDashboard />}
        {activeSubTab === 'trends' && <TrendAnalysis dateRange={dateRange} />}
        {activeSubTab === 'reports' && <ReportsExport dateRange={dateRange} />}
        {activeSubTab === 'activity' && <ActivityLogs />}
      </div>
    </div>
  );
};

export default AnalyticsHub;