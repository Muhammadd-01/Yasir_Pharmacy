import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, FolderTree, ShoppingCart,
    Users, Settings, Menu, X, LogOut, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: FolderTree, label: 'Categories', path: '/categories' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: Users, label: 'Users', path: '/users' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const NavLink = ({ item }) => {
        const isActive = location.pathname === item.path;
        return (
            <Link
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                        ? 'bg-neon-silver/20 text-white'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
            >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-b border-border z-40 flex items-center px-4">
                <button onClick={() => setMobileOpen(true)} className="p-2">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center">
                    <span className="font-bold">Admin Panel</span>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-screen bg-background border-r border-border z-50
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-silver to-gray-400 flex items-center justify-center">
                                <span className="text-sm font-bold text-black">Y</span>
                            </div>
                            <span className="font-bold">Admin</span>
                        </div>
                    )}
                    <button className="hidden lg:block p-2 hover:bg-white/5 rounded-lg" onClick={() => setCollapsed(!collapsed)}>
                        <Menu className="w-5 h-5" />
                    </button>
                    <button className="lg:hidden p-2" onClick={() => setMobileOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} item={item} />
                    ))}
                </nav>

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-neon-silver/20 flex items-center justify-center">
                            {user?.name?.[0] || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`
        min-h-screen transition-all duration-300
        pt-16 lg:pt-0
        ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}
      `}>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </>
    );
};

export default Sidebar;
