// client/src/components/home/HomeAnalytics.jsx
import { useState, useEffect } from 'react';
import { FileText, Users, Eye } from 'lucide-react';

const HomeAnalytics = () => {
  const [stats, setStats] = useState({ papers: 0, users: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cache first (5min validity)
    const cached = localStorage.getItem('homeStats');
    const cacheTime = localStorage.getItem('homeStatsTime');
    const now = Date.now();
    
    if (cached && cacheTime && (now - parseInt(cacheTime)) < 300000) {
      setStats(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, {
          headers,
          signal: controller.signal
        });

        if (res.ok) {
          const data = await res.json();
          const newStats = {
            papers: data.totalPapers || 0,
            users: data.totalUsers || 0,
            views: data.totalViews || 0
          };
          
          setStats(newStats);
          localStorage.setItem('homeStats', JSON.stringify(newStats));
          localStorage.setItem('homeStatsTime', now.toString());
        } else {
          // Use fallback
          setStats({ papers: 150, users: 500, views: 12000 });
        }
      } catch (error) {
        // Use fallback on error
        setStats({ papers: 150, users: 500, views: 12000 });
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchStats();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const items = [
    { icon: FileText, value: stats.papers, label: 'Papers', color: 'bg-blue-500' },
    { icon: Users, value: stats.users, label: 'Users', color: 'bg-blue-600' },
    { icon: Eye, value: stats.views.toLocaleString(), label: 'Views', color: 'bg-blue-700' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {items.map((item, i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${item.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-md`}>
              <item.icon className="text-white" size={window.innerWidth < 640 ? 20 : 24} />
            </div>
            
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                {loading ? (
                  <div className="h-8 sm:h-10 md:h-12 bg-blue-100 dark:bg-blue-900 rounded animate-pulse"></div>
                ) : (
                  item.value
                )}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Activity indicator */}
      {loading && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
            Loading stats...
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeAnalytics;