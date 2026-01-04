import { motion } from 'framer-motion';
import { Pill, GraduationCap, Clock, Stethoscope } from 'lucide-react';

const Services = () => {
    const services = [
        {
            title: "Online Prescription Refill",
            icon: Pill,
            description: "Upload your prescription and get your medicines delivered to your doorstep.",
            color: "text-blue-500"
        },
        {
            title: "Pharmacist Consultation",
            icon: GraduationCap,
            description: "Talk to our expert pharmacists about your medication and health concerns.",
            color: "text-green-500"
        },
        {
            title: "24/7 Delivery",
            icon: Clock,
            description: "We are open round the clock to serve your emergency medical needs.",
            color: "text-purple-500"
        },
        {
            title: "Health Checkups",
            icon: Stethoscope,
            description: "Basic health checkups including BP monitoring and blood sugar tests.",
            color: "text-red-500"
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 chrome-text">Our Services</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Dedicated to serving your healthcare needs with professionalism and care.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-8 rounded-2xl neon-border flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
                        >
                            <div className={`p-4 rounded-full bg-background border border-border mb-6 ${service.color}`}>
                                <service.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                            <p className="text-muted-foreground">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
