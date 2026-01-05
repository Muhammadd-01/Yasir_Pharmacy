import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ShoppingCart, Info, AlertTriangle, Clock } from 'lucide-react';
import { notificationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsAPI.getAll();
            setNotifications(res.data.data.notifications || []);
            setUnreadCount(res.data.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAsRead('all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationsAPI.delete(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingCart className="w-5 h-5 text-blue-400" />;
            case 'product': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            default: return <Info className="w-5 h-5 text-gray-400" />;
        }
    };

    const handleClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }

        if (notification.type === 'order') {
            navigate('/orders');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-foreground">Notifications</h1>
                        <p className="text-muted-foreground mt-1">Stay updated with your orders and alerts</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-silver/10 hover:bg-neon-silver/20 text-neon-silver transition-colors text-sm font-medium"
                        >
                            <Check className="w-4 h-4" /> Mark all read
                        </button>
                    )}
                </div>

                <div className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-xl min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-neon-silver border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
                            <p className="text-muted-foreground max-w-sm">
                                We'll let you know when there are updates about your orders or important announcements.
                            </p>
                            <Link to="/" className="mt-6 px-6 py-2 bg-neon-silver text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        onClick={() => handleClick(notification)}
                                        className={`group relative p-6 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-primary/20' : 'bg-muted'}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className={`text-base font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    <span className="flex-shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                                                            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                                                        className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 ml-auto"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-primary"></div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
