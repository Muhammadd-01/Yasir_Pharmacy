import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, ShoppingCart, User, LogOut,
    ChevronDown, Search, ArrowRight, Bell, Heart
} from 'lucide-react';
import { useAuth, useCart, useNotification } from '@/context';
import { notificationsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { productsAPI } from '@/lib/api';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate(); // Added useNavigate
    const { isAuthenticated, user, logout } = useAuth();
    const { cart } = useCart();

    // State
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Fetch notifications count
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        }
    }, [isAuthenticated, location.pathname]); // Re-fetch on navigation

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationsAPI.getAll({ unreadOnly: true });
            setUnreadNotifications(res.data.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Search functionality
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const res = await productsAPI.getAll({ search: searchQuery, limit: 5 });
                setSearchResults(res.data.data.products || []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setActiveDropdown(null);
            navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const navigationItems = [
        { label: 'Home', href: '/' },
        {
            label: 'Medicines',
            href: '/medicines',
            dropdown: [
                { label: 'Tablets', href: '/medicines?subcategory=Tablet' },
                { label: 'Capsules', href: '/medicines?subcategory=Capsule' },
                { label: 'Syrups', href: '/medicines?subcategory=Syrup' },
                { label: 'Injections', href: '/medicines?subcategory=Injection' },
            ]
        },
        {
            label: 'General Items',
            href: '/general-items',
            dropdown: [
                { label: 'Personal Care', href: '/general-items?subcategory=Personal Care' },
                { label: 'Baby Care', href: '/general-items?subcategory=Baby Care' },
                { label: 'Household', href: '/general-items?subcategory=Household' },
                { label: 'Beverages', href: '/general-items?subcategory=Beverages' },
            ]
        },
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
                                            className="absolute top-full left-0 mt-2 w-56 py-2 rounded-xl bg-popover border border-border shadow-xl z-50 flex flex-col"
                                        >
                                            {item.dropdown.map((subItem, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={subItem.href}
                                                    className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Search - Only for authenticated users */}
                        {isAuthenticated && (
                            <div className="relative flex items-center">
                                <AnimatePresence>
                                    {activeDropdown === 'search' && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 250, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            className="relative"
                                        >
                                            <form onSubmit={handleSearchSubmit}>
                                                <input
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="h-9 w-full rounded-l-lg border border-r-0 border-border bg-background px-3 text-sm focus:outline-none"
                                                    placeholder="Search products..."
                                                    autoFocus
                                                />
                                            </form>

                                            {/* Search Results Dropdown */}
                                            {searchQuery.length >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                                                >
                                                    {searchLoading ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Searching...
                                                        </div>
                                                    ) : searchResults.length > 0 ? (
                                                        <div className="py-2">
                                                            {searchResults.map((product) => (
                                                                <Link
                                                                    key={product._id}
                                                                    to={`/ ${product.type === 'medicine' ? 'medicines' : 'general-items'}/${product.slug}`}
                                                                    onClick={() => {
                                                                        setActiveDropdown(null);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                                                                >
                                                                    <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                                                        {product.images?.[0]?.url && (
                                                                            <img
                                                                                src={product.images[0].url}
                                                                                alt={product.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                                                        <p className="text-xs text-muted-foreground">Rs. {product.price?.toLocaleString()}</p>
                                                                    </div>
                                                                </Link >
                                                            ))}
                                                            <Link
                                                                to={`/medicines?search=${encodeURIComponent(searchQuery)}`}
                                                                onClick={() => {
                                                                    setActiveDropdown(null);
                                                                    setSearchQuery('');
                                                                }}
                                                                className="block px-4 py-2 text-sm text-primary hover:bg-accent transition-colors border-t border-border"
                                                            >
                                                                View all results →
                                                            </Link>
                                                        </div >
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            No products found
                                                        </div>
                                                    )}
                                                </motion.div >
                                            )}
                                        </motion.div >
                                    )}
                                </AnimatePresence >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setActiveDropdown(activeDropdown === 'search' ? null : 'search')}
                                    className={`${activeDropdown === 'search' ? 'rounded-l-none border border-l-0 border-border' : ''}`}
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </div >
                        )}

                        {/* Notifications */}
                        {
                            isAuthenticated && (
                                <Link to="/notifications" className="relative">
                                    <Button variant="ghost" size="icon">
                                        <Bell className="w-5 h-5" />
                                        {unreadNotifications > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-background"
                                            >
                                                {unreadNotifications}
                                            </motion.span>
                                        )}
                                    </Button>
                                </Link>
                            )
                        }

                        {/* Wishlist */}
                        {
                            isAuthenticated && (
                                <Link to="/wishlist" className="relative">
                                    <Button variant="ghost" size="icon">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )
                        }

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

                        {/* Theme Toggle - Updated Position */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>

                        {/* User Menu */}
                        {
                            isAuthenticated ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown('user')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-full overflow-hidden">
                                        {user?.profileImage ? (
                                            <img
                                                src={getImageUrl(user.profileImage)}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
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
                                                    <p className="font-medium text-sm text-foreground truncate">{user?.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate" title={user?.email}>{user?.email}</p>
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
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button variant="ghost" size="sm">Login</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">Register</Button>
                                    </Link>
                                </div>
                            )
                        }

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div >
                </nav >
            </div >

            {/* Mobile Menu */}
            < AnimatePresence >
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
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </header >
    );
};

export default Navbar;
