import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Facebook, Twitter, Instagram, Linkedin,
    Mail, Phone, MapPin, Clock,
    CreditCard, Truck, Shield, Headphones
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'Medicines', href: '/medicines' },
        { label: 'General Items', href: '/general-items' },
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const customerService = [
        { label: 'My Account', href: '/profile' },
        { label: 'Order Tracking', href: '/orders' },
        { label: 'Wishlist', href: '/wishlist' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Return Policy', href: '/return-policy' },
    ];

    const features = [
        { icon: Truck, label: 'Free Delivery', desc: 'On orders over Rs. 5000' },
        { icon: Shield, label: 'Secure Payment', desc: '100% secure checkout' },
        { icon: Headphones, label: '24/7 Support', desc: 'Dedicated support' },
        { icon: CreditCard, label: 'Easy Returns', desc: '7 days return policy' },
    ];

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="relative mt-20">
            {/* Features Section */}
            <div className="border-t border-b border-border bg-background/50">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-neon-silver/10 flex items-center justify-center neon-border">
                                    <feature.icon className="w-6 h-6 text-neon-silver" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{feature.label}</h4>
                                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="bg-gradient-to-b from-background to-black/50 pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div>
                            <Link to="/" className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-silver to-neon-glow flex items-center justify-center">
                                    <span className="text-xl font-bold text-black">Y</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg neon-text">Yasir Pharmacy</h1>
                                    <p className="text-[10px] text-muted-foreground -mt-1">& General Store</p>
                                </div>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-6">
                                Your trusted partner for quality medicines and daily essentials.
                                We deliver health and happiness to your doorstep.
                            </p>
                            <div className="flex gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-silver/20 hover:neon-glow transition-all duration-300"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
                            <ul className="space-y-3">
                                {quickLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-muted-foreground hover:text-neon-silver transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div>
                            <h3 className="font-semibold text-lg mb-6">Customer Service</h3>
                            <ul className="space-y-3">
                                {customerService.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-muted-foreground hover:text-neon-silver transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-neon-silver flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-muted-foreground">
                                        123 Main Street, City Center<br />
                                        Karachi, Pakistan
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-neon-silver" />
                                    <a href="tel:+923001234567" className="text-sm text-muted-foreground hover:text-neon-silver">
                                        +92 300 123 4567
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-neon-silver" />
                                    <a href="mailto:info@yasirpharmacy.com" className="text-sm text-muted-foreground hover:text-neon-silver">
                                        info@yasirpharmacy.com
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-neon-silver" />
                                    <span className="text-sm text-muted-foreground">
                                        Mon - Sat: 9AM - 10PM
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="section-divider mb-6" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <p>© {currentYear} Yasir Pharmacy & General Store. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy-policy" className="hover:text-neon-silver transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-neon-silver transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
