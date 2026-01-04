import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Pill, Package, Star, Shield,
    Truck, Clock, Users, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCardSkeleton, CategoryCardSkeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import { productsAPI, categoriesAPI } from '@/lib/api';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [featuredRes, arrivalsRes, categoriesRes] = await Promise.all([
                productsAPI.getFeatured(8),
                productsAPI.getNewArrivals(8),
                categoriesAPI.getAll({ includeCount: 'true' })
            ]);

            setFeaturedProducts(featuredRes.data.data || []);
            setNewArrivals(arrivalsRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { value: '50K+', label: 'Happy Customers', icon: Users },
        { value: '10K+', label: 'Products', icon: Package },
        { value: '24/7', label: 'Support', icon: Clock },
        { value: '100%', label: 'Genuine Products', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Stats Section */}
            <section className="py-16 relative bg-background">
                <div className="container mx-auto px-4 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 rounded-xl glass-card relative group hover:-translate-y-1 transition-transform"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Shop by <span className="text-primary">Category</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Explore our wide range of products across various categories
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <CategoryCardSkeleton key={i} />
                            ))
                        ) : (
                            categories.slice(0, 8).map((category, idx) => (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <Link
                                        to={`/${category.type === 'medicine' ? 'medicines' : 'general-items'}?category=${category._id}`}
                                        className="block group"
                                    >
                                        <div className="glass-card rounded-xl p-6 card-hover text-center h-full flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                {category.type === 'medicine' ? (
                                                    <Pill className="w-8 h-8 text-primary" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-primary" />
                                                )}
                                            </div>
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.productCount || 0} products
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                Featured <span className="text-primary">Products</span>
                            </h2>
                            <p className="text-muted-foreground">Handpicked quality products for you</p>
                        </div>
                        <Link to="/medicines?featured=true" className="hidden md:flex items-center gap-2 text-primary hover:underline">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))
                        ) : featuredProducts.length > 0 ? (
                            featuredProducts.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground py-12">
                                No featured products available yet
                            </p>
                        )}
                    </div>

                    <div className="text-center mt-8 md:hidden">
                        <Link to="/medicines?featured=true">
                            <Button variant="outline">View All Products</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                New <span className="text-primary">Arrivals</span>
                            </h2>
                            <p className="text-muted-foreground">Latest additions to our collection</p>
                        </div>
                        <Link to="/medicines?sort=-createdAt" className="hidden md:flex items-center gap-2 text-primary hover:underline">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))
                        ) : newArrivals.length > 0 ? (
                            newArrivals.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground py-12">
                                No products available yet
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Choose <span className="text-primary">Yasir Pharmacy</span>?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We're committed to providing the best healthcare experience
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: '100% Genuine Products',
                                description: 'All our products are sourced directly from authorized manufacturers and distributors. Quality guaranteed.'
                            },
                            {
                                icon: Truck,
                                title: 'Fast & Free Delivery',
                                description: 'Enjoy free delivery on orders above Rs. 5000. Same-day delivery available in select areas.'
                            },
                            {
                                icon: Star,
                                title: 'Expert Consultation',
                                description: 'Our team of qualified pharmacists is available 24/7 to answer your health-related queries.'
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 text-white"
                    >
                        <div className="relative z-10 p-12 md:p-20 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Ready to Experience<br />
                                <span className="text-primary-foreground">Premium Healthcare?</span>
                            </h2>
                            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
                                Join thousands of satisfied customers who trust Yasir Pharmacy for their health needs.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/register">
                                    <Button size="lg" className="bg-white text-black hover:bg-zinc-100">
                                        Create Account
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 hover:text-white">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;

