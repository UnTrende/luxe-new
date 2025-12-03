import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { LoyaltyHistoryEntry } from '../types';
import { ArrowLeft, Star, AlertTriangle, Gift } from 'lucide-react';

const LoyaltyHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user: loggedInUser, isLoading } = useAuth();
    const [transactions, setTransactions] = useState<LoyaltyHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (!isLoading && !loggedInUser) {
            navigate('/login');
            return;
        }

        fetchTransactions();
    }, [loggedInUser, isLoading, page, navigate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const newTransactions = await api.getLoyaltyHistory(20, page * 20);
            setTransactions(prev => page === 0 ? newTransactions : [...prev, ...newTransactions]);
            setHasMore(newTransactions.length === 20);
        } catch (err) {
            setError('Failed to load loyalty history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'EARNED':
                return <Star className="text-green-400" size={16} />;
            case 'PENALTY':
                return <AlertTriangle className="text-red-400" size={16} />;
            case 'REDEEMED':
                return <Gift className="text-blue-400" size={16} />;
            default:
                return <Star className="text-gray-400" size={16} />;
        }
    };

    const formatTransactionType = (type: string) => {
        switch (type) {
            case 'EARNED':
                return 'Points Earned';
            case 'PENALTY':
                return 'Penalty Applied';
            case 'REDEEMED':
                return 'Points Redeemed';
            default:
                return type;
        }
    };

    if (isLoading) {
        return <div className="text-center p-10 text-subtle-text">Loading loyalty history...</div>;
    }

    if (!loggedInUser) {
        return <div className="text-center p-10 text-subtle-text">Please log in to view your loyalty history.</div>;
    }

    return (
        <div className="min-h-screen bg-midnight pt-8 pb-32 px-6">
            <div className="max-w-lg mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <h1 className="text-2xl font-serif font-bold text-white">Loyalty History</h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {transactions.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <Star size={48} className="text-gold/30 mx-auto mb-4" />
                            <p className="text-subtle-text">No loyalty transactions yet</p>
                            <p className="text-sm text-subtle-text/70 mt-2">
                                Start booking services to earn points!
                            </p>
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div 
                                key={transaction.id} 
                                className="bg-glass-card border border-white/5 p-4 rounded-2xl flex items-start gap-4 backdrop-blur-md"
                            >
                                <div className="mt-1">
                                    {getTransactionIcon(transaction.transaction_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-white">
                                            {formatTransactionType(transaction.transaction_type)}
                                        </h3>
                                        <span className={`font-bold ${transaction.points_amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {transaction.points_amount > 0 ? '+' : ''}{transaction.points_amount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-subtle-text mt-1">
                                        {transaction.description}
                                    </p>
                                    <p className="text-xs text-subtle-text/70 mt-2">
                                        {new Date(transaction.created_at).toLocaleDateString()} •{' '}
                                        {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <button
                            onClick={loadMore}
                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyHistoryPage;