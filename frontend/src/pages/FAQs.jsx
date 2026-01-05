import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, MessageCircle, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';

const FAQs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIdx, setActiveIdx] = useState(null);

    const faqData = [
        {
            category: "Ordering",
            icon: MessageCircle,
            questions: [
                {
                    q: "How do I place an order?",
                    a: "You can place an order by browsing our products, adding them to your cart, and proceeding to checkout. You'll need to provide your contact details and delivery address."
                },
                {
                    q: "Can I cancel my order?",
                    a: "Yes, you can cancel your order within 1 hour of placement from your 'My Orders' section, provided it hasn't been shipped yet."
                }
            ]
        },
        {
            category: "Shipping & Delivery",
            icon: Truck,
            questions: [
                {
                    q: "What are your delivery charges?",
                    a: "We offer free delivery on orders above Rs. 5000. For orders below this amount, a standard delivery fee of Rs. 200 is applicable."
                },
                {
                    q: "How long does delivery take?",
                    a: "Typically, local deliveries within Karachi take 1-2 business days. Deliveries to other cities may take 3-5 business days."
                }
            ]
        },
        {
            category: "Safety & Quality",
            icon: ShieldCheck,
            questions: [
                {
                    q: "Are the medicines authentic?",
                    a: "Absolutely. We source all our medicines directly from authorized distributors and reputable manufacturers to ensure 100% authenticity."
                },
                {
                    q: "Do you require a prescription?",
                    a: "For scheduled drugs and specialized medications, a valid prescription from a registered medical practitioner is mandatory."
                }
            ]
        },
        {
            category: "Returns & Refunds",
            icon: RefreshCcw,
            questions: [
                {
                    q: "What is your return policy?",
                    a: "We have a 7-day return policy for most items. Please refer to our detailed 'Return Policy' page for conditions and exceptions."
                },
                {
                    q: "How do I get a refund?",
                    a: "Once your return is approved, the refund will be processed to your original payment method or as store credit within 5-7 business days."
                }
            ]
        }
    ];

    const filteredFaqs = faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-silver/10 border border-neon-silver/20 text-neon-silver mb-4"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Help Center</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neon-silver to-white mb-6"
                    >
                        Frequently Asked Questions
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Find answers to common questions about our services, orders, and policies.
                    </motion.p>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative max-w-xl mx-auto mb-16"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-silver/50 focus:outline-none transition-all placeholder:text-muted-foreground/50 shadow-2xl"
                    />
                </motion.div>

                {/* FAQ List */}
                <div className="space-y-12">
                    {filteredFaqs.map((category, catIdx) => (
                        <div key={catIdx}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-neon-silver/10 flex items-center justify-center neon-border">
                                    <category.icon className="w-5 h-5 text-neon-silver" />
                                </div>
                                <h2 className="text-xl font-bold text-neon-silver">{category.category}</h2>
                            </div>

                            <div className="space-y-4">
                                {category.questions.map((faq, qIdx) => {
                                    const itemIdx = `${catIdx}-${qIdx}`;
                                    const isOpen = activeIdx === itemIdx;

                                    return (
                                        <motion.div
                                            key={qIdx}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            className={`rounded-2xl border transition-all duration-300 ${isOpen
                                                    ? 'bg-white/5 border-neon-silver/30 shadow-lg'
                                                    : 'bg-transparent border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setActiveIdx(isOpen ? null : itemIdx)}
                                                className="w-full px-6 py-5 text-left flex justify-between items-center gap-4"
                                            >
                                                <span className={`font-medium transition-colors ${isOpen ? 'text-white' : 'text-muted-foreground'}`}>
                                                    {faq.q}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-neon-silver' : 'text-muted-foreground'}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                                            {faq.a}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFaqs.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-muted-foreground">No questions found matching your search.</p>
                        <button onClick={() => setSearchTerm('')} className="text-neon-silver mt-2 hover:underline">Clear search</button>
                    </div>
                )}

                {/* Contact Footer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-8 rounded-3xl bg-gradient-to-br from-neon-silver/10 to-transparent border border-neon-silver/20 text-center"
                >
                    <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                    <p className="text-muted-foreground mb-8">Can't find the answer you're looking for? Please contact our friendly team.</p>
                    <button className="px-8 py-3 rounded-full bg-neon-silver text-black font-bold hover:neon-glow transition-all duration-300">
                        Contact Support
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQs;
