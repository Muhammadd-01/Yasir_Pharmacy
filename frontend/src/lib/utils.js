import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}


export function formatDate(date) {
    if (!date) return "";
    return format(new Date(date), "PPP");
}

export function getImageUrl(path) {
    if (!path) return '/placeholder-product.jpg';

    // Handle object inputs safely
    if (typeof path === 'object') {
        return path.url ? getImageUrl(path.url) : '/placeholder-product.jpg';
    }

    if (typeof path !== 'string') return '/placeholder-product.jpg';

    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
