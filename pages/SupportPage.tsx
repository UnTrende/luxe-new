import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, ArrowLeft, Send, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const SupportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: loggedInUser, isLoading } = useAuth();

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!isLoading && !loggedInUser) {
            navigate('/login', { state: { from: location.pathname + location.search + location.hash } });
        }
    }, [loggedInUser, isLoading, navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            // Placeholder: Implement actual support message sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Message sent! We\'ll get back to you soon.');
            setMessage('');
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

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
                        <h1 className="text-3xl font-serif font-bold text-white">Support</h1>
                        <p className="text-subtle-text text-xs uppercase tracking-widest">We're here to help</p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-white font-serif font-bold text-lg">Get in Touch</h3>
                    
                    {/* Phone */}
                    <a href="tel:+971501234567" className="block bg-glass-card border border-white/5 rounded-2xl p-4 hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Phone size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Call Us</p>
                                <p className="text-sm text-subtle-text">+971 50 123 4567</p>
                            </div>
                        </div>
                    </a>

                    {/* Email */}
                    <a href="mailto:support@luxecut.com" className="block bg-glass-card border border-white/5 rounded-2xl p-4 hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Mail size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Email Us</p>
                                <p className="text-sm text-subtle-text">support@luxecut.com</p>
                            </div>
                        </div>
                    </a>

                    {/* Location */}
                    <div className="bg-glass-card border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <MapPin size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Visit Us</p>
                                <p className="text-sm text-subtle-text">The Dubai Mall, Ground Floor</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Send Message Form */}
                <div className="space-y-4">
                    <h3 className="text-white font-serif font-bold text-lg">Send a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-subtle-text uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle size={14} />
                                Your Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                placeholder="How can we help you?"
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-subtle-text focus:outline-none focus:border-gold/50 transition-colors resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSending || !message.trim()}
                            className="w-full py-4 bg-gold-gradient text-midnight font-bold rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {isSending ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h3 className="text-white font-serif font-bold text-lg">Quick Help</h3>
                    <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-3">
                        <div>
                            <p className="text-white font-medium text-sm mb-1">How do I cancel a booking?</p>
                            <p className="text-xs text-subtle-text">Go to "My Bookings" and tap the cancel button on your upcoming appointment.</p>
                        </div>
                        <div className="border-t border-white/5 pt-3">
                            <p className="text-white font-medium text-sm mb-1">Can I reschedule my appointment?</p>
                            <p className="text-xs text-subtle-text">Cancel your current booking and create a new one with your preferred time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
