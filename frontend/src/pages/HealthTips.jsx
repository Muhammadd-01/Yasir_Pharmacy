import { motion } from 'framer-motion';
import { Heart, Activity, Brain, Shield } from 'lucide-react';

const HealthTips = () => {
    const tips = [
        {
            title: "Immunity Boosting",
            icon: Shield,
            content: "Regular exercise and a balanced diet rich in Vitamin C are key to a strong immune system.",
            color: "text-blue-500"
        },
        {
            title: "Heart Health",
            icon: Heart,
            content: "Maintain a healthy weight and monitor your blood pressure regularly to reduce heart risks.",
            color: "text-red-500"
        },
        {
            title: "Mental Wellness",
            icon: Brain,
            content: "Quality sleep and stress management techniques like meditation are vital for mental health.",
            color: "text-purple-500"
        },
        {
            title: "Active Lifestyle",
            icon: Activity,
            content: "Aim for at least 30 minutes of moderate physical activity every day.",
            color: "text-green-500"
        }
    ];

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 chrome-text">Health & Wellness Tips</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Expert advice to help you live a healthier, happier life.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {tips.map((tip, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-8 rounded-2xl neon-border hover:bg-accent/5 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-background border border-border ${tip.color}`}>
                                    <tip.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {tip.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthTips;
