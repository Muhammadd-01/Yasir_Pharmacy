import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Admin Auth
export const adminAuthAPI = {
    login: (data) => api.post('/auth/admin/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Products Admin
export const productsAPI = {
    getAll: (params) => api.get('/products/admin/all', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
    toggle: (id) => api.patch(`/products/${id}/toggle`),
};

// Categories Admin
export const categoriesAPI = {
    getAll: (params) => api.get('/categories/admin/all', { params }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Orders Admin
export const ordersAPI = {
    getAll: (params) => api.get('/orders/admin/all', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    updateStatus: (id, status, note) => api.patch(`/orders/admin/${id}/status`, { status, note }),
    getStats: () => api.get('/orders/admin/stats'),
};

// Users Admin
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    toggle: (id) => api.patch(`/users/${id}/toggle`),
    getStats: () => api.get('/users/stats'),
};
