import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const slides = [
        {
            id: 1,
            title: "Healthcare Fundamentals",
            subtitle: "Trusted Medicines & Essentials",
            description: "Get 15% off on your first order of prescribed medicines. Quality you can trust.",
            image: "https://images.unsplash.com/photo-1631549916768-4119b2d5f926?q=80&w=2079&auto=format&fit=crop",
            color: "from-blue-600/90 to-teal-500/90",
            cta: "Shop Medicines",
            link: "/medicines"
        },
        {
            id: 2,
            title: "Baby & Mom Care",
            subtitle: "Gentle Care for Little Ones",
            description: "Explore our premium range of baby products. Safe, gentle, and dermatologist approved.",
            image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop",
            color: "from-purple-600/90 to-pink-500/90",
            cta: "Explore Care",
            link: "/general-items?category=baby-care"
        },
        {
            id: 3,
            title: "Wellness & Vitamins",
            subtitle: "Boost Your Immunity",
            description: "Top-rated supplements to keep you and your family healthy and active.",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop",
            color: "from-amber-500/90 to-orange-500/90",
            cta: "View Vitamins",
            link: "/medicines?category=vitamins"
        }
    ];

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        // Auto-play
        const interval = setInterval(() => {
            if (emblaApi.canScrollNext()) emblaApi.scrollNext();
        }, 5000);

        emblaApi.on('select', onSelect);

        return () => {
            clearInterval(interval);
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    return (
        <div className="relative h-[600px] w-full overflow-hidden bg-background">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="relative flex-[0_0_100%] h-full">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />
                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} mix-blend-multiply`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                            {/* Content */}
                            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={selectedIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="max-w-2xl"
                                >
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium text-sm mb-6">
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                                        {slide.description}
                                    </p>
                                    <Link to={slide.link}>
                                        <Button
                                            size="lg"
                                            className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-black/10 transition-transform hover:scale-105"
                                        >
                                            {slide.cta} <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-10 right-10 flex gap-4 z-20 hidden md:flex">
                <button
                    onClick={scrollPrev}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-md transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={scrollNext}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-md transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20 md:hidden">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        className={`w-3 h-3 rounded-full transition-all ${selectedIndex === index ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
