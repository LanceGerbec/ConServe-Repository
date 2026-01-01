// client/src/components/home/HomeAnalytics.jsx
import { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, Activity } from 'lucide-react';

const HomeAnalytics = () => {
  const [stats, setStats] = useState({
    papers: 0,
    users: 0,
    views: 0,
    loading: true,
    error: false
  });

  useEffect(() => {
    // Check if we have cached stats (cache for 5 minutes)
    const cachedStats = localStorage.getItem('homeStats');
    const cacheTime = localStorage.getItem('homeStatsTime');
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (cachedStats && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
      // Use cached data immediately
      const cached = JSON.parse(cachedStats);
      setStats({ ...cached, loading: false, error: false });
      return;
    }

    // Fetch fresh data
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Parallel requests with timeout
      const [researchRes, userRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/research/stats`, { 
          headers, 
          signal: controller.signal 
        }),
        fetch(`${import.meta.env.VITE_API_URL}/users/stats`, { 
          headers, 
          signal: controller.signal 
        })
      ]);

      clearTimeout(timeoutId);

      if (!researchRes.ok || !userRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const [researchData, userData] = await Promise.all([
        researchRes.json(),
        userRes.json()
      ]);

      // Calculate total views from approved papers
      const viewsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/research?status=approved&limit=1000`, 
        { headers, signal: controller.signal }
      );
      
      let totalViews = 0;
      if (viewsRes.ok) {
        const viewsData = await viewsRes.json();
        totalViews = (viewsData.papers || []).reduce((sum, p) => sum + (p.views || 0), 0);
      }

      const newStats = {
        papers: researchData.approved || 0,
        users: userData.activeUsers || 0,
        views: totalViews,
        loading: false,
        error: false
      };

      setStats(newStats);

      // Cache the results
      localStorage.setItem('homeStats', JSON.stringify({
        papers: newStats.papers,
        users: newStats.users,
        views: newStats.views
      }));
      localStorage.setItem('homeStatsTime', Date.now().toString());

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Stats fetch error:', error);
      
      // Try to use stale cache if available
      const staleCache = localStorage.getItem('homeStats');
      if (staleCache) {
        const cached = JSON.parse(staleCache);
        setStats({ ...cached, loading: false, error: false });
      } else {
        setStats({ papers: 0, users: 0, views: 0, loading: false, error: true });
      }
    }
  };

  const StatCard = ({ icon: Icon, value, label }) => (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon size={18} className="text-navy dark:text-blue-400 flex-shrink-0" />
        <div className="text-xl md:text-2xl font-black text-navy dark:text-blue-400">
          {stats.loading ? '...' : value}
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
        {label}
      </div>
    </div>
  );

  if (stats.error && !stats.papers && !stats.users && !stats.views) {
    return null; // Hide if error and no cached data
  }

  return (
    <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-4 md:px-8 md:py-4 rounded-2xl shadow-xl border border-navy/20">
      <StatCard 
        icon={FileText} 
        value={`${stats.papers}+`} 
        label="Research Papers" 
      />
      <StatCard 
        icon={Users} 
        value={`${stats.users}+`} 
        label="Active Researchers" 
      />
      <StatCard 
        icon={TrendingUp} 
        value={`${stats.views.toLocaleString()}+`} 
        label="Total Views" 
      />
    </div>
  );
};

export default HomeAnalytics;