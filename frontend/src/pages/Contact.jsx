import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotification } from '@/context';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        notify.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setLoading(false);
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Address',
            content: '123 Main Street, City Center\nKarachi, Pakistan'
        },
        {
            icon: Phone,
            title: 'Phone',
            content: '+92 300 123 4567\n+92 21 1234567'
        },
        {
            icon: Mail,
            title: 'Email',
            content: 'info@yasirpharmacy.com\nsupport@yasirpharmacy.com'
        },
        {
            icon: Clock,
            title: 'Hours',
            content: 'Mon - Sat: 9AM - 10PM\nSunday: 10AM - 8PM'
        }
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Hero */}
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
                            Get In <span className="chrome-text">Touch</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Have questions? We'd love to hear from you. Send us a message
                            and we'll respond as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {contactInfo.map((info, idx) => (
                            <motion.div
                                key={info.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card rounded-xl p-6 flex gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-silver/20 to-transparent flex items-center justify-center flex-shrink-0">
                                    <info.icon className="w-6 h-6 text-neon-silver" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{info.title}</h3>
                                    <p className="text-muted-foreground text-sm whitespace-pre-line">{info.content}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Quick Chat */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card rounded-xl p-6 neon-border"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <MessageCircle className="w-6 h-6 text-neon-silver" />
                                <h3 className="font-semibold">Need Quick Help?</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Chat with our healthcare experts on WhatsApp for immediate assistance.
                            </p>
                            <a
                                href="https://wa.me/923001234567"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="glow" size="sm" className="w-full">
                                    Start WhatsApp Chat
                                </Button>
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-card rounded-2xl p-8 neon-border">
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+92 300 123 4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={6}
                                        required
                                        className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-silver/50 focus:border-neon-silver/50 transition-all duration-300 resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="glow"
                                    size="lg"
                                    className="w-full md:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 glass-card rounded-2xl p-4 neon-border"
                >
                    <div className="aspect-[21/9] rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 mx-auto mb-4 text-neon-silver" />
                            <p className="text-muted-foreground">Map integration coming soon</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                123 Main Street, City Center, Karachi, Pakistan
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
