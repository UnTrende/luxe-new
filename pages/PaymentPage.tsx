import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Plus, ArrowLeft, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: loggedInUser, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !loggedInUser) {
            navigate('/login', { state: { from: location.pathname + location.search + location.hash } });
        }
    }, [loggedInUser, isLoading, navigate, location]);

    if (isLoading || !loggedInUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-midnight">
                <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight pt-8 pb-32 px-6">
            <div className="max-w-lg mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white">Payment Methods</h1>
                        <p className="text-subtle-text text-xs uppercase tracking-widest">Manage your payment options</p>
                    </div>
                </div>

                {/* Current Payment Method */}
                <div className="bg-glass-card border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-serif font-bold text-lg">Current Method</h3>
                        <Wallet size={20} className="text-gold" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-90 shadow-sm" />
                        <div className="flex-1">
                            <p className="text-white font-medium">•••• •••• •••• 8842</p>
                            <p className="text-xs text-subtle-text">Expires 12/28</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase tracking-widest">
                            Active
                        </span>
                    </div>
                </div>

                {/* Add New Payment Method */}
                <button
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gold/30 rounded-xl flex items-center justify-center gap-3 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-midnight transition-all">
                        <Plus size={20} />
                    </div>
                    <span className="text-white font-medium">Add New Payment Method</span>
                </button>

                {/* Info Note */}
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                    <p className="text-xs text-gold/80 leading-relaxed">
                        <strong className="text-gold">Note:</strong> Payment integration is currently in development. 
                        All bookings and orders are processed offline at the shop.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
