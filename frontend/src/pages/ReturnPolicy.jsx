import { motion } from 'framer-motion';
import { RefreshCcw, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

const ReturnPolicy = () => {
    const sections = [
        {
            title: "Policy Overview",
            icon: RefreshCcw,
            content: "We want you to be completely satisfied with your purchase from Yasir Pharmacy. If you have received a wrong, damaged, or defective product, you can initiate a return within 7 days of delivery."
        },
        {
            title: "Conditions for Return",
            icon: ShieldCheck,
            items: [
                "Product must be in original condition.",
                "Original packaging and tags must be intact.",
                "Proof of purchase (invoice) is mandatory.",
                "The product must be unused or in the same condition as received."
            ]
        },
        {
            title: "Non-Returnable Items",
            icon: XCircle,
            content: "For safety and hygiene reasons, certain items cannot be returned:",
            items: [
                "Refrigerated or temperature-sensitive medications.",
                "Opened or used personal care items.",
                "Health supplements with broken seals.",
                "Prescription medications (unless incorrect or damaged)."
            ]
        },
        {
            title: "The Refund Process",
            icon: CheckCircle2,
            content: "Once our medical quality assurance team verifies the returned product, we will process your refund:",
            items: [
                "Bank Transfer: 7-10 business days.",
                "Store Credit: Immediate (preferred for faster future checkouts).",
                "Original Payment Method: Depending on your bank's policy."
            ]
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center">
            <div className="container mx-auto max-w-4xl">
                {/* Hero Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-neon-silver/10 rounded-3xl flex items-center justify-center mx-auto mb-8 neon-border"
                    >
                        <RefreshCcw className="w-10 h-10 text-neon-silver" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
                    >
                        Returns & Refunds
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Transparent policies to ensure a worry-free shopping experience for your health and wellness.
                    </motion.p>
                </div>

                {/* Policy Sections */}
                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-3xl p-8 border border-white/5 hover:border-neon-silver/20 transition-all duration-500"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-neon-silver/5 flex items-center justify-center flex-shrink-0">
                                    <section.icon className="w-6 h-6 text-neon-silver" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                                    {section.content && (
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            {section.content}
                                        </p>
                                    )}
                                    {section.items && (
                                        <ul className="grid md:grid-cols-2 gap-3">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground/80">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-silver" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Important Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-12 flex items-start gap-4 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20"
                >
                    <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <strong className="text-amber-400 block mb-1">Important Notice:</strong>
                        <p className="text-muted-foreground">
                            Due to health regulations, we cannot accept returns of medicines once they have left our pharmacy premises unless they are incorrect or potentially defective from the manufacturer. Please check your order upon delivery.
                        </p>
                    </div>
                </motion.div>

                {/* Footer Action */}
                <div className="mt-20 text-center">
                    <p className="text-muted-foreground mb-6">Need to initiate a return?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-3 rounded-xl bg-neon-silver text-black font-bold hover:neon-glow transition-all">
                            Start Return Process
                        </button>
                        <button className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicy;
