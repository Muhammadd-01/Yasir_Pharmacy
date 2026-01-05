import { createContext, useContext, useState, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

// Notification types with their styling
const notificationStyles = {
    success: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/90',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        icon: CheckCircle,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-900 dark:text-emerald-100',
        descriptionColor: 'text-emerald-700 dark:text-emerald-200/80',
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/90',
        border: 'border-red-200 dark:border-red-500/30',
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-100',
        descriptionColor: 'text-red-700 dark:text-red-200/80',
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/90',
        border: 'border-amber-200 dark:border-amber-500/30',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-900 dark:text-amber-100',
        descriptionColor: 'text-amber-700 dark:text-amber-200/80',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/90',
        border: 'border-blue-200 dark:border-blue-500/30',
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-100',
        descriptionColor: 'text-blue-700 dark:text-blue-200/80',
    },
    auth: {
        bg: 'bg-zinc-50 dark:bg-zinc-900/95',
        border: 'border-zinc-200 dark:border-neon-silver/30',
        icon: AlertCircle,
        iconColor: 'text-primary dark:text-neon-silver',
        textColor: 'text-foreground',
        descriptionColor: 'text-muted-foreground',
    },
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: 'info',
            duration: 5000,
            ...notification,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = {
        success: (message, options = {}) =>
            addNotification({ type: 'success', message, ...options }),
        error: (message, options = {}) =>
            addNotification({ type: 'error', message, ...options }),
        warning: (message, options = {}) =>
            addNotification({ type: 'warning', message, ...options }),
        info: (message, options = {}) =>
            addNotification({ type: 'info', message, ...options }),
        auth: (message, options = {}) =>
            addNotification({ type: 'auth', message, showAuthButtons: true, duration: 0, ...options }),
    };

    return (
        <NotificationContext.Provider value={{ notify, addNotification, removeNotification }}>
            {children}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </NotificationContext.Provider>
    );
};

// Notification container component
const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        notification={notification}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Individual notification component
const Notification = forwardRef(({ notification, onRemove }, ref) => {
    const style = notificationStyles[notification.type] || notificationStyles.info;
    const Icon = style.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
        pointer-events-auto rounded-xl p-4 
        ${style.bg} 
        border ${style.border}
        backdrop-blur-xl shadow-2xl
        neon-border
      `}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className={`font-semibold ${style.textColor} mb-1`}>{notification.title}</h4>
                    )}
                    <p className={`text-sm ${style.descriptionColor}`}>{notification.message}</p>

                    {notification.showAuthButtons && (
                        <div className="flex gap-3 mt-4">
                            <a
                                href="/login"
                                className="btn-glow text-sm px-4 py-2"
                            >
                                Login
                            </a>
                            <a
                                href="/register"
                                className="btn-premium text-sm px-4 py-2 text-white"
                            >
                                Register
                            </a>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onRemove(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
});

export default NotificationContext;
