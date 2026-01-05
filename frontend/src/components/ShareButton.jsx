import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const ShareButton = ({ title, text, url }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareData = {
        title: title || 'Check this out!',
        text: text || 'I found this amazing product!',
        url: url || window.location.href
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: Phone, // Using Phone icon as placeholder specifically for WhatsApp if needed, or import FaWhatsapp
            url: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`,
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
            color: 'bg-sky-500 hover:bg-sky-600'
        }
    ];

    return (
        <div className="relative">
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 z-50 min-w-[200px] p-2 rounded-xl border border-border bg-popover shadow-xl"
                        >
                            <div className="grid gap-2">
                                {shareLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white transition-colors ${link.color}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">Share on {link.name}</span>
                                    </a>
                                ))}
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors w-full text-left"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    <span className="text-sm font-medium">
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButton;
