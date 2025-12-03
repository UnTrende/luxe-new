import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <div 
    className={`bg-glass-card border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors ${onClick ? 'hover:border-gold/30' : ''}`}
    onClick={onClick}
  >
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-subtle-text text-sm">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminLoyaltyDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in a real implementation, this would come from the backend
  const stats = {
    totalMembers: 1242,
    activePoints: 245680,
    tierDistribution: {
      silver: 842,
      gold: 320,
      platinum: 80
    },
    recentActivity: 42
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Loyalty Program</h2>
        <p className="text-subtle-text">Manage your customer rewards program</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers} 
          icon={<Users size={24} className="text-blue-400" />} 
          color="bg-blue-500/20" 
        />
        <StatCard 
          title="Active Points" 
          value={stats.activePoints.toLocaleString()} 
          icon={<Star size={24} className="text-yellow-400" />} 
          color="bg-yellow-500/20" 
        />
        <StatCard 
          title="Platinum Members" 
          value={stats.tierDistribution.platinum} 
          icon={<Award size={24} className="text-purple-400" />} 
          color="bg-purple-500/20" 
        />
        <StatCard 
          title="Recent Activity" 
          value={stats.recentActivity} 
          icon={<TrendingUp size={24} className="text-green-400" />} 
          color="bg-green-500/20" 
        />
      </div>

      <div className="bg-glass-card border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Tier Distribution</h3>
          <button 
            onClick={() => navigate('/admin/loyalty-settings')}
            className="px-4 py-2 bg-gold text-black rounded-lg font-medium text-sm hover:bg-yellow-400 transition-colors"
          >
            Manage Settings
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-subtle-text">Silver Tier</span>
              <span className="text-white">{stats.tierDistribution.silver} members</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full" 
                style={{ width: `${(stats.tierDistribution.silver / stats.totalMembers) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-subtle-text">Gold Tier</span>
              <span className="text-white">{stats.tierDistribution.gold} members</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(stats.tierDistribution.gold / stats.totalMembers) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-subtle-text">Platinum Tier</span>
              <span className="text-white">{stats.tierDistribution.platinum} members</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${(stats.tierDistribution.platinum / stats.totalMembers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoyaltyDashboard;