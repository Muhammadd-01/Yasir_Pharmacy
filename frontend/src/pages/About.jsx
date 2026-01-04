import { motion } from 'framer-motion';
import { Shield, Heart, Users, Clock, Award, Target } from 'lucide-react';

const About = () => {
    const stats = [
        { value: '50K+', label: 'Happy Customers' },
        { value: '10K+', label: 'Products' },
        { value: '5+', label: 'Years Experience' },
        { value: '24/7', label: 'Customer Support' },
    ];

    const values = [
        {
            icon: Shield,
            title: 'Quality Assurance',
            description: 'We source only genuine, certified products from authorized manufacturers and distributors.'
        },
        {
            icon: Heart,
            title: 'Customer Care',
            description: 'Your health and satisfaction are our top priorities. We go the extra mile to serve you better.'
        },
        {
            icon: Users,
            title: 'Expert Team',
            description: 'Our team of qualified pharmacists and healthcare professionals is always ready to assist you.'
        },
        {
            icon: Clock,
            title: 'Fast Delivery',
            description: 'We ensure quick and reliable delivery to your doorstep, even for urgent medical needs.'
        },
        {
            icon: Award,
            title: 'Trusted Brand',
            description: 'Thousands of families trust us for their healthcare needs. We take this responsibility seriously.'
        },
        {
            icon: Target,
            title: 'Our Mission',
            description: 'To make quality healthcare accessible and affordable for everyone in our community.'
        },
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-background" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,192,192,0.15)_0%,transparent_50%)]" />

                <div className="container mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            About <span className="chrome-text">Yasir Pharmacy</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Your trusted partner in health and wellness since 2019. We're committed to
                            providing quality medicines and daily essentials to our community with care and dedication.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-xl p-6 text-center neon-border"
                            >
                                <div className="text-4xl font-bold chrome-text mb-2">{stat.value}</div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Our <span className="chrome-text">Story</span>
                            </h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Yasir Pharmacy & General Store was founded with a simple yet powerful vision:
                                    to make quality healthcare accessible to everyone in our community. What started
                                    as a small neighborhood pharmacy has grown into a trusted name serving thousands
                                    of families.
                                </p>
                                <p>
                                    Our founder, Yasir Ahmed, a passionate pharmacist with over 15 years of experience,
                                    noticed the gap between quality healthcare products and their accessibility. He
                                    envisioned a pharmacy that not only provides genuine medicines but also educates
                                    and supports customers in their health journey.
                                </p>
                                <p>
                                    Today, we continue to uphold these values, combining traditional care with modern
                                    convenience. Our online platform brings the same trusted service that our customers
                                    have loved for years, right to their fingertips.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-2xl p-8 neon-border"
                        >
                            <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-silver to-neon-glow mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-black">Y</span>
                                    </div>
                                    <p className="text-muted-foreground">Serving since 2019</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-20 bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Our <span className="chrome-text">Values</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These core values guide everything we do and how we serve our community
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, idx) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-xl p-6 hover:neon-glow transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-silver/20 to-transparent flex items-center justify-center mb-4">
                                    <value.icon className="w-6 h-6 text-neon-silver" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card rounded-3xl p-12 text-center neon-border"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Have Questions?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            We're here to help. Reach out to us for any inquiries about our products
                            or services, and we'll get back to you as soon as possible.
                        </p>
                        <a href="/contact">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-glow px-8 py-3"
                            >
                                Contact Us
                            </motion.button>
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
