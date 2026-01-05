import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function getImageUrl(path) {
    if (!path) return '/placeholder-product.jpg';

    // Handle object inputs safely
    if (typeof path === 'object') {
        return path.url ? getImageUrl(path.url) : '/placeholder-product.jpg';
    }

    if (typeof path !== 'string') return '/placeholder-product.jpg';

    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
