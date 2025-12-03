import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Moon, Globe, Lock, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: loggedInUser, isLoading } = useAuth();

    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: false,
        darkMode: true,
        language: 'en',
    });

    useEffect(() => {
        if (!isLoading && !loggedInUser) {
            navigate('/login', { state: { from: location.pathname + location.search + location.hash } });
        }
    }, [loggedInUser, isLoading, navigate, location]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
                        <h1 className="text-3xl font-serif font-bold text-white">Settings</h1>
                        <p className="text-subtle-text text-xs uppercase tracking-widest">Customize your experience</p>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-4">
                    <h3 className="text-white font-serif font-bold text-lg">Preferences</h3>
                    
                    {/* Notifications Toggle */}
                    <div className="bg-glass-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Bell size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Push Notifications</p>
                                <p className="text-xs text-subtle-text">Get booking updates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleSetting('notifications')}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                settings.notifications ? 'bg-gold' : 'bg-white/10'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Email Alerts Toggle */}
                    <div className="bg-glass-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Bell size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Email Alerts</p>
                                <p className="text-xs text-subtle-text">Receive email updates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleSetting('emailAlerts')}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                settings.emailAlerts ? 'bg-gold' : 'bg-white/10'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="bg-glass-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Moon size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Dark Mode</p>
                                <p className="text-xs text-subtle-text">Always on</p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="w-12 h-6 rounded-full bg-gold cursor-not-allowed"
                        >
                            <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <div className="space-y-4">
                    <h3 className="text-white font-serif font-bold text-lg">Account</h3>
                    
                    {/* Language */}
                    <button className="w-full bg-glass-card border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Globe size={18} className="text-gold" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Language</p>
                                <p className="text-xs text-subtle-text">English</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-subtle-text" />
                    </button>

                    {/* Privacy & Security */}
                    <button className="w-full bg-glass-card border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Lock size={18} className="text-gold" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Privacy & Security</p>
                                <p className="text-xs text-subtle-text">Manage your data</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-subtle-text" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
