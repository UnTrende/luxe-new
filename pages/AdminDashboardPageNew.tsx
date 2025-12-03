import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Service, Product, Barber, Booking, UserProfile, SiteSettings, Attendance, OrderWithDetails } from '../types';

// Import refactored components
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminServicesManager } from '../components/admin/AdminServicesManager';
import { AdminProductsManager } from '../components/admin/AdminProductsManager';
import { AdminBarbersManager } from '../components/admin/AdminBarbersManager';
import { AdminUsersManager } from '../components/admin/AdminUsersManager';
import { AdminBookingsManager } from '../components/admin/AdminBookingsManager';
import { AdminOrdersManager } from '../components/admin/AdminOrdersManager';
import { AdminRosterManager } from '../components/admin/AdminRosterManager';
import { AdminAttendanceManager } from '../components/admin/AdminAttendanceManager';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import AdminLoyaltyDashboard from '../components/admin/AdminLoyaltyDashboard';
import {
  LayoutDashboard,
  Scissors,
  ShoppingBag,
  Users,
  Calendar,
  ClipboardList,
  Clock,
  Settings,
  BarChart3,
  Package,
  Star
} from 'lucide-react';

export default function AdminDashboardPageNew() {
  console.log('🎯 NEW AdminDashboard: Component mounting safely!');

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    shop_name: 'LuxeCut Barber Shop',
    allow_signups: true
  });
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [rosters, setRosters] = useState<any[]>([]);
  const [productSalesDays, setProductSalesDays] = useState(30);

  // Derived stats for AdminOverview
  const [stats, setStats] = useState({
    totalRevenue: 0,
    weeklyGrowth: '0',
    averageRating: '4.8',
    satisfaction: 4.8,
    topServices: [] as (Service & { bookingCount: number })[],
    activeChairs: { active: 0, total: 0 },
    newBookingsCount: 0
  });

  const [productSales, setProductSales] = useState({
    dailyRevenue: [] as { date: string; revenue: number }[],
    topProducts: [] as { product_id: string; name: string; revenue: number; quantity: number }[]
  });

  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
  }, [user, authLoading, navigate]);

  // Data fetching
  useEffect(() => {
    if (!user || user.role !== 'admin' || authLoading) return;

    const fetchDashboardData = async () => {
      console.log('📊 Fetching dashboard data...');
      setLoading(true);
      setError(null);

      try {
        const [
          servicesData,
          productsData,
          barbersData,
          usersData,
          bookingsData,
          settingsData,
          attendanceData,
          ordersData,
          rostersData
        ] = await Promise.all([
          api.getServices().catch(err => { console.warn('Services fetch failed:', err); return []; }),
          api.getProducts().catch(err => { console.warn('Products fetch failed:', err); return []; }),
          api.getBarbers().catch(err => { console.warn('Barbers fetch failed:', err); return []; }),
          api.getAllUsers().catch(err => { console.warn('Users fetch failed:', err); return { users: [] }; }),
          api.getAllBookings().catch(err => { console.warn('Bookings fetch failed:', err); return []; }),
          api.getSettings().catch(err => { console.warn('Settings fetch failed:', err); return { success: false, data: { shop_name: 'LuxeCut', allow_signups: true } }; }),
          api.getAttendance().catch(err => { console.warn('Attendance fetch failed:', err); return []; }),
          api.getAllOrders().catch(err => { console.warn('Orders fetch failed:', err); return []; }),
          api.getRosters().catch(err => { console.warn('Rosters fetch failed:', err); return { rosters: [] }; })
        ]);

        setServices(servicesData || []);
        setProducts(productsData || []);
        setBarbers(barbersData || []);
        setUsers(usersData?.users || []);
        setBookings(bookingsData || []);
        setSiteSettings(settingsData.data || { shop_name: 'LuxeCut Barber Shop', allow_signups: true });
        setAttendanceRecords(attendanceData || []);
        setOrders(ordersData || []);
        setRosters(rostersData?.rosters || []);

        // Calculate comprehensive stats
        const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (o.totalPrice || o.total_amount || 0), 0);

        // Calculate top services
        const topServiceCounts: Record<string, number> = {};
        (bookingsData || []).forEach(b => {
          b.serviceIds?.forEach(id => {
            topServiceCounts[id] = (topServiceCounts[id] || 0) + 1;
          });
        });

        const topServices = Object.entries(topServiceCounts)
          .map(([id, count]) => {
            const service = servicesData?.find(s => s.id === id);
            return service ? { ...service, bookingCount: count } : null;
          })
          .filter(Boolean)
          .sort((a, b) => (b?.bookingCount || 0) - (a?.bookingCount || 0))
          .slice(0, 5) as (Service & { bookingCount: number })[];

        // Calculate active chairs (barbers currently working)
        const today = new Date().toISOString().split('T')[0];
        const activeBarbers = (attendanceData || []).filter(a =>
          a.date === today && (a.status === 'present' || a.status === 'Present')
        ).length;

        // Calculate new bookings (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newBookingsCount = (bookingsData || []).filter(b => {
          // Use createdAt if available (after migration), otherwise use date
          const bookingDate = b.createdAt
            ? new Date(b.createdAt)
            : new Date(b.date);
          return bookingDate > oneDayAgo;
        }).length;

        // Calculate product sales
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - productSalesDays);

        const recentOrders = (ordersData || []).filter(o =>
          new Date(o.created_at || o.timestamp) >= cutoffDate
        );

        // Daily revenue
        const dailyRevenueMap: Record<string, number> = {};
        recentOrders.forEach(o => {
          const date = new Date(o.created_at || o.timestamp).toISOString().split('T')[0];
          dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + (o.totalPrice || o.total_amount || 0);
        });

        const dailyRevenue = Object.entries(dailyRevenueMap)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Top products
        const productRevenueMap: Record<string, { revenue: number; quantity: number; name: string }> = {};
        recentOrders.forEach(o => {
          const pid = o.productId || o.product_id;
          const pname = o.products?.name || o.product?.name || 'Unknown';
          if (!productRevenueMap[pid]) {
            productRevenueMap[pid] = { revenue: 0, quantity: 0, name: pname };
          }
          productRevenueMap[pid].revenue += (o.totalPrice || o.total_amount || 0);
          productRevenueMap[pid].quantity += o.quantity || 1;
        });

        const topProducts = Object.entries(productRevenueMap)
          .map(([product_id, data]) => ({ product_id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setStats({
          totalRevenue,
          weeklyGrowth: '12.5', // Mock for now
          averageRating: '4.8',
          satisfaction: 4.8,
          topServices,
          activeChairs: { active: activeBarbers, total: barbersData?.length || 0 },
          newBookingsCount
        });

        setProductSales({ dailyRevenue, topProducts });

      } catch (error) {
        console.error('📊 Dashboard data fetch error:', error);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-sync user role
    if (user?.id) {
      api.syncUserRole(user.id, 'admin').catch(err => console.error('Failed to sync admin role:', err));
    }

    // Polling
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dubai-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dubai-black font-serif text-xl animate-pulse">Loading Empire View...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl border border-red-500/30 shadow-xl">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-dubai-black font-serif text-2xl mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-dubai-gold text-dubai-black font-bold rounded-xl hover:bg-white hover:shadow-lg transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'Overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'Services', icon: <Scissors size={20} />, label: 'Services' },
    { id: 'Products', icon: <ShoppingBag size={20} />, label: 'Products' },
    { id: 'Barbers', icon: <Users size={20} />, label: 'Barbers' },
    { id: 'Users', icon: <Users size={20} />, label: 'Clients' },
    { id: 'Bookings', icon: <Calendar size={20} />, label: 'Bookings' },
    { id: 'Rosters', icon: <ClipboardList size={20} />, label: 'Rosters' },
    { id: 'Attendance', icon: <Clock size={20} />, label: 'Attendance' },
    { id: 'Orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'Settings', icon: <Settings size={20} />, label: 'Settings' },
    { id: 'Analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { id: 'Loyalty', icon: <Star size={20} />, label: 'Loyalty' },
  ];

  return (
    <div className="min-h-screen bg-midnight-gradient flex font-sans text-white selection:bg-gold selection:text-black overflow-hidden">
      <ToastContainer theme="dark" position="bottom-right" aria-label="Notifications" />

      {/* Glassmorphism Sidebar */}
      <aside className="w-72 bg-glass-card flex-shrink-0 fixed h-full z-20 hidden lg:flex flex-col border-r border-white/5 shadow-glass backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <h1 className="text-3xl font-serif font-bold text-white tracking-wider relative z-10">LUXECUT</h1>
          <p className="text-xs text-gold uppercase tracking-[0.3em] mt-1 font-bold relative z-10">Empire View</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden animate-slide-up ${activeTab === item.id
                ? 'text-midnight font-bold shadow-glow transform scale-[1.02]'
                : 'text-subtle-text hover:text-white hover:bg-white/5'
                }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gold-gradient" />
              )}

              <span className={`text-xl relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'text-midnight' : 'text-gold'}`}>{item.icon}</span>
              <span className="uppercase tracking-wider text-xs relative z-10">{item.label}</span>

              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-midnight animate-pulse relative z-10" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-bold shadow-glow">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-white">{user?.email}</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => api.auth.signOut().then(() => navigate('/login'))}
            className="w-full py-3 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest text-subtle-text"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen relative">
        {/* Background Ambient Glow */}
        <div className="fixed top-0 left-72 right-0 h-96 bg-gold/5 blur-[100px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="lg:hidden bg-glass-card border-b border-white/5 p-4 sticky top-0 z-30 flex justify-between items-center shadow-glass backdrop-blur-xl">
          <span className="font-serif font-bold text-white text-xl tracking-wider">LUXECUT</span>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="appearance-none bg-black/50 border border-white/10 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
            >
              {menuItems.map(item => (
                <option key={item.id} value={item.id} className="bg-card-bg text-white">
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold text-xs">
              ▼
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto relative z-10">
          <div className="mb-8 flex justify-between items-end animate-fade-in">
            <div>
              <h2 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                <span className="text-gold animate-pulse-glow p-2 rounded-full bg-white/5">{menuItems.find(i => i.id === activeTab)?.icon}</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">{activeTab}</span>
              </h2>
              <p className="text-subtle-text font-light tracking-wide">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="bg-glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-glass">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-bold text-white/80 tracking-wider uppercase text-xs">System Operational</span>
              </div>
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {activeTab === 'Overview' && (
              <AdminOverview
                stats={stats}
                bookings={bookings}
                services={services}
                users={users}
                productSales={productSales}
                productSalesDays={productSalesDays}
                setProductSalesDays={setProductSalesDays}
              />
            )}

            {activeTab === 'Services' && (
              <AdminServicesManager
                services={services}
                setServices={setServices}
              />
            )}

            {activeTab === 'Products' && (
              <AdminProductsManager
                products={products}
                setProducts={setProducts}
              />
            )}

            {activeTab === 'Barbers' && (
              <AdminBarbersManager
                barbers={barbers}
                setBarbers={setBarbers}
              />
            )}

            {activeTab === 'Users' && (
              <AdminUsersManager
                users={users}
                setUsers={setUsers}
              />
            )}

            {activeTab === 'Bookings' && (
              <AdminBookingsManager
                bookings={bookings}
                setBookings={setBookings}
                services={services}
                barbers={barbers}
              />
            )}

            {activeTab === 'Orders' && (
              <AdminOrdersManager
                orders={orders}
                setOrders={setOrders}
              />
            )}

            {activeTab === 'Rosters' && (
              <AdminRosterManager
                rosters={rosters}
                setRosters={setRosters}
                barbers={barbers}
              />
            )}

            {activeTab === 'Attendance' && (
              <AdminAttendanceManager
                attendanceRecords={attendanceRecords}
                setAttendanceRecords={setAttendanceRecords}
                barbers={barbers}
              />
            )}

            {activeTab === 'Settings' && (
              <AdminSettings
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
              />
            )}

            {activeTab === 'Analytics' && (
              <AdminAnalytics
                services={services}
                products={products}
                barbers={barbers}
                users={users}
                bookings={bookings}
                rosters={rosters}
                orders={orders}
                attendanceRecords={attendanceRecords}
                stats={stats}
              />
            )}
            
            {activeTab === 'Loyalty' && (
              <AdminLoyaltyDashboard />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}