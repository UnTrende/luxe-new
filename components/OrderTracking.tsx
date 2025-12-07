import React, { useState } from 'react';
import { Package, CheckCircle, Truck, Home, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderWithDetails } from '../types';

interface OrderTrackingProps {
    order: OrderWithDetails;
    compact?: boolean;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, compact = false }) => {
    const [isExpanded, setIsExpanded] = useState(!compact);

    const product = order.products;
    if (!product) return null;

    // Define order status steps
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: Home },
    ];

    // Determine current step index
    const getCurrentStepIndex = () => {
        if (order.status === 'cancelled') return -1;
        const statusMap: { [key: string]: number } = {
            'pending': 0,
            'confirmed': 1,
            'shipped': 2,
            'delivered': 3,
        };
        return statusMap[order.status] ?? 0;
    };

    const currentStepIndex = getCurrentStepIndex();
    const isCancelled = order.status === 'cancelled';

    // Get status color
    const getStatusColor = () => {
        if (isCancelled) return 'text-red-400';
        if (currentStepIndex === 3) return 'text-green-400';
        return 'text-dubai-gold';
    };

    const getStatusBgColor = () => {
        if (isCancelled) return 'bg-red-500/20 border-red-500/30';
        if (currentStepIndex === 3) return 'bg-green-500/20 border-green-500/30';
        return 'bg-dubai-gold/20 border-dubai-gold/30';
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-dubai-gold/30 transition-all duration-300">
            {/* Order Header */}
            <div
                className={`p-4 ${compact ? 'cursor-pointer' : ''}`}
                onClick={() => compact && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-4">
                    {/* Product Image */}
                    {product.imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-serif font-bold text-lg truncate">
                                    {product.name}
                                </h3>
                                <p className="text-subtle-text text-xs">
                                    Order ID: {order.id.slice(0, 8)}...
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-dubai-gold font-serif font-bold text-xl">
                                    ${(product.price * order.quantity).toFixed(2)}
                                </p>
                                <p className="text-subtle-text text-xs">Qty: {order.quantity}</p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBgColor()} ${getStatusColor()}`}>
                                {isCancelled ? 'Cancelled' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className="text-subtle-text text-xs">
                                {new Date(order.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    {compact && (
                        <button className="text-subtle-text hover:text-white transition-colors flex-shrink-0">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Tracking Timeline */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5">
                    {isCancelled ? (
                        <div className="flex items-center gap-3 py-4 text-red-400">
                            <XCircle size={24} />
                            <div>
                                <p className="font-medium">Order Cancelled</p>
                                <p className="text-xs text-subtle-text">This order has been cancelled</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative py-4">
                            {/* Timeline */}
                            <div className="flex items-center justify-between relative">
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
                                    <div
                                        className="h-full bg-dubai-gold transition-all duration-500"
                                        style={{
                                            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Steps */}
                                {steps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.key} className="relative flex flex-col items-center z-10">
                                            {/* Step Circle */}
                                            <div
                                                className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                                    ${isCompleted
                                                        ? 'bg-dubai-gold text-dubai-black shadow-lg shadow-dubai-gold/50'
                                                        : 'bg-white/5 text-subtle-text border border-white/10'
                                                    }
                                                    ${isCurrent ? 'ring-4 ring-dubai-gold/30 scale-110' : ''}
                                                `}
                                            >
                                                <StepIcon size={18} />
                                            </div>

                                            {/* Step Label */}
                                            <p className={`
                                                mt-2 text-xs text-center max-w-[70px] leading-tight
                                                ${isCompleted ? 'text-white font-medium' : 'text-subtle-text'}
                                            `}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
