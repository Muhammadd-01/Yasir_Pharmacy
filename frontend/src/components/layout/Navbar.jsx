import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, ShoppingCart, User, LogOut,
    ChevronDown, Search, ArrowRight
} from 'lucide-react';
import { useAuth, useCart } from '@/context';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const { cart } = useCart();

    // State
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigationItems = [
        { label: 'Home', href: '/' },
        {
            label: 'Shop',
            href: '#',
            dropdown: [
                {
                    label: 'Medicines',
                    href: '/medicines',
                    subItems: [
                        { label: 'Prescription Drugs', href: '/medicines?category=prescription' },
                        { label: 'Over The Counter', href: '/medicines?category=otc' },
                        { label: 'Vitamins & Supplements', href: '/medicines?category=vitamins' },
                        { label: 'First Aid', href: '/medicines?category=first-aid' },
                    ]
                },
                {
                    label: 'General Items',
                    href: '/general-items',
                    subItems: [
                        { label: 'Personal Care', href: '/general-items?category=personal-care' },
                        { label: 'Baby Care', href: '/general-items?category=baby-care' },
                        { label: 'Household', href: '/general-items?category=household' },
                        { label: 'Beverages', href: '/general-items?category=beverages' },
                    ]
                },
            ]
        },
        { label: 'Health Tips', href: '/health-tips' },
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-500
                ${isScrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5'
                    : 'bg-transparent'
                }
            `}
        >
            <div className="container mx-auto px-4">
                <nav className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-xl font-bold text-white">Y</span>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg text-foreground">Yasir Pharmacy</h1>
                            <p className="text-[10px] text-muted-foreground -mt-1">& General Store</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative group"
                                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    to={item.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-300
                                        ${location.pathname === item.href
                                            ? 'text-primary bg-primary/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }
                                    `}
                                >
                                    {item.label}
                                    {item.dropdown && (
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </Link>

                                {/* Main Dropdown */}
                                <AnimatePresence>
                                    {item.dropdown && activeDropdown === item.label && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-64 py-2 rounded-xl bg-popover border border-border shadow-xl z-50 flex flex-col"
                                        >
                                            {item.dropdown.map((subItem, idx) => (
                                                <div key={idx} className="relative group/sub">
                                                    <Link
                                                        to={subItem.href}
                                                        className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                    >
                                                        {subItem.label}
                                                        {subItem.subItems && (
                                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                                        )}
                                                    </Link>

                                                    {/* Nested Sidebar Dropdown */}
                                                    {subItem.subItems && (
                                                        <div className="absolute top-0 left-full ml-2 w-56 py-2 rounded-xl bg-popover border border-border shadow-xl invisible opacity-0 -translate-x-2 group-hover/sub:visible group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-200">
                                                            {subItem.subItems.map((nestedItem, nIdx) => (
                                                                <Link
                                                                    key={nIdx}
                                                                    to={nestedItem.href}
                                                                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                                >
                                                                    {nestedItem.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>

                        <Button variant="ghost" size="icon" className="hidden md:flex">
                            <Search className="w-5 h-5" />
                        </Button>

                        {/* Cart */}
                        <Link to="/cart" className="relative">
                            <Button variant="ghost" size="icon">
                                <ShoppingCart className="w-5 h-5" />
                                {cart?.totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                                    >
                                        {cart.totalItems}
                                    </motion.span>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div
                                className="relative"
                                onMouseEnter={() => setActiveDropdown('user')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Button variant="ghost" size="icon">
                                    <User className="w-5 h-5" />
                                </Button>

                                <AnimatePresence>
                                    {activeDropdown === 'user' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full right-0 mt-2 w-48 py-2 rounded-xl bg-popover border border-border shadow-xl z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-border">
                                                <p className="font-medium text-sm text-foreground">{user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                            <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-accent text-foreground">
                                                Profile
                                            </Link>
                                            <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-accent text-foreground">
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">Login</Button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            <div className="flex justify-end p-2">
                                <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex gap-2">
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </Button>
                            </div>
                            {navigationItems.map((item) => (
                                <div key={item.label}>
                                    <Link
                                        to={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <span className="text-foreground">{item.label}</span>
                                    </Link>
                                    {item.dropdown && (
                                        <div className="ml-8 space-y-1">
                                            {item.dropdown.map((subItem, idx) => (
                                                <div key={idx}>
                                                    <Link
                                                        to={subItem.href}
                                                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium"
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                    {/* Mobile Nested */}
                                                    {subItem.subItems && (
                                                        <div className="ml-4 space-y-1">
                                                            {subItem.subItems.map((nestedItem, nIdx) => (
                                                                <Link
                                                                    key={nIdx}
                                                                    to={nestedItem.href}
                                                                    className="block px-4 py-1.5 text-xs text-muted-foreground/80 hover:text-foreground"
                                                                >
                                                                    {nestedItem.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
