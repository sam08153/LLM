import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, RefreshCw } from 'lucide-react';

const InsightsSidebar = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/insights');
      setInsights(response.data.trends);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setInsights(['Could not load trends. Ensure data is uploaded.', 'Check backend connectivity.', 'Market data unavailable.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="w-80 h-full bg-founder-blue text-white p-6 shadow-2xl flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <TrendingUp className="text-founder-gold" size={24} />
          Market Trends
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-10 animate-spin">
            <RefreshCw size={24} />
          </div>
        ) : (
          <div className="space-y-6">
            {insights.map((trend, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default group">
                <p className="text-sm font-medium leading-relaxed group-hover:text-founder-gold transition-colors">
                  {trend}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button 
          onClick={fetchInsights}
          className="w-full py-3 bg-white/5 border border-white/20 rounded-lg text-xs font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={12} />
          RECALCULATE INSIGHTS
        </button>
      </div>
    </div>
  );
};

export default InsightsSidebar;
