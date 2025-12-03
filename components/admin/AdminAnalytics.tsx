import React from 'react';
import { Service, Product, Barber, UserProfile, Booking, OrderWithDetails, Attendance } from '../../types';
import { BarChart3, TrendingUp, Users, ShoppingBag, Calendar, Clock, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface Stats {
    totalRevenue: number;
    weeklyGrowth: string;
    customerSatisfaction: number;
    topService: string;
}

interface AdminAnalyticsProps {
    services: Service[];
    products: Product[];
    barbers: Barber[];
    users: UserProfile[];
    bookings: Booking[];
    rosters: any[];
    orders: OrderWithDetails[];
    attendanceRecords: Attendance[];
    stats: Stats;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
    services,
    products,
    barbers,
    users,
    bookings,
    rosters,
    orders,
    attendanceRecords,
    stats
}) => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative bg-glass-card p-8 rounded-3xl border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <BarChart3 size={24} />
                        </span>
                        Analytics Dashboard
                    </h2>
                    <p className="text-subtle-text text-sm">Real-time business insights and performance metrics</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-glass-card rounded-3xl border border-white/10 p-6 hover:border-gold/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-white" />
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-white mb-1 group-hover:text-gold transition-colors">{users.length}</h3>
                    <p className="text-subtle-text text-sm uppercase tracking-wider font-bold">Total Users</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                        <span className="text-green-400 flex items-center gap-1"><TrendingUp size={12} /> +12%</span> vs last month
                    </div>
                </div>

                <div className="bg-glass-card rounded-3xl border border-white/10 p-6 hover:border-gold/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={64} className="text-white" />
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-white mb-1 group-hover:text-gold transition-colors">{products.length}</h3>
                    <p className="text-subtle-text text-sm uppercase tracking-wider font-bold">Products</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                        <span className="text-green-400 flex items-center gap-1"><TrendingUp size={12} /> +5%</span> new items
                    </div>
                </div>

                <div className="bg-glass-card rounded-3xl border border-white/10 p-6 hover:border-gold/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={64} className="text-white" />
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-white mb-1 group-hover:text-gold transition-colors">{bookings.length}</h3>
                    <p className="text-subtle-text text-sm uppercase tracking-wider font-bold">Total Bookings</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                        <span className="text-green-400 flex items-center gap-1"><TrendingUp size={12} /> +8%</span> conversion rate
                    </div>
                </div>

                <div className="bg-glass-card rounded-3xl border border-white/10 p-6 hover:border-gold/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={64} className="text-white" />
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-white mb-1 group-hover:text-gold transition-colors">{orders.length}</h3>
                    <p className="text-subtle-text text-sm uppercase tracking-wider font-bold">Total Orders</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                        <span className="text-green-400 flex items-center gap-1"><TrendingUp size={12} /> +15%</span> sales growth
                    </div>
                </div>
            </div>

            {/* Detailed Insights */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Recent Activity */}
                <div className="bg-glass-card rounded-3xl border border-white/10 p-8 hover:border-gold/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-gold" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Pending Bookings</span>
                            <span className="text-white font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs border border-yellow-500/20">
                                {bookings.filter(b => b.status === 'pending').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Confirmed Bookings</span>
                            <span className="text-white font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs border border-green-500/20">
                                {bookings.filter(b => b.status === 'confirmed').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Active Customers</span>
                            <span className="text-white font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs border border-blue-500/20">
                                {users.filter(u => u.role === 'customer').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Staff Members</span>
                            <span className="text-white font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg text-xs border border-purple-500/20">
                                {users.filter(u => u.role === 'barber').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Order Insights */}
                <div className="bg-glass-card rounded-3xl border border-white/10 p-8 hover:border-gold/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Package size={18} className="text-gold" />
                        Order Insights
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Pending Orders</span>
                            <span className="text-white font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs border border-yellow-500/20">
                                {orders.filter(o => o.status === 'pending').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Shipped Orders</span>
                            <span className="text-white font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs border border-blue-500/20">
                                {orders.filter(o => o.status === 'shipped').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Delivered Orders</span>
                            <span className="text-white font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs border border-green-500/20">
                                {orders.filter(o => o.status === 'delivered').length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-subtle-text text-sm">Total Revenue</span>
                            <span className="text-gold font-bold font-mono">
                                ${orders.reduce((sum, order) => sum + (order.totalPrice || order.total_amount || 0), 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Financial Overview */}
                <div className="bg-glass-card rounded-3xl border border-white/10 p-8 hover:border-gold/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign size={18} className="text-gold" />
                        Financial Overview
                    </h3>
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl border border-gold/20">
                            <p className="text-subtle-text text-xs font-bold uppercase tracking-widest mb-2">Total Revenue</p>
                            <h4 className="text-3xl font-serif font-bold text-white">
                                ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-subtle-text text-sm">Weekly Growth</span>
                                <span className={`font-bold flex items-center gap-1 ${Number(stats.weeklyGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {Number(stats.weeklyGrowth) >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                                    {Number(stats.weeklyGrowth) >= 0 ? '+' : ''}{stats.weeklyGrowth}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-subtle-text text-sm">Avg. Order Value</span>
                                <span className="text-white font-bold font-mono">
                                    ${orders.length > 0 ? (orders.reduce((sum, o) => sum + (o.totalPrice || o.total_amount || 0), 0) / orders.length).toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
