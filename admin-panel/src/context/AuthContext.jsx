import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('adminAccessToken');
            if (!token) { setLoading(false); return; }
            const response = await adminAuthAPI.getMe();
            const userData = response.data.data;
            if (userData.role !== 'admin' && userData.role !== 'superadmin') {
                throw new Error('Not authorized');
            }
            setUser(userData);
        } catch (error) {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminUser');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await adminAuthAPI.login({ email, password });
            const { user: userData, accessToken, refreshToken } = response.data.data;
            localStorage.setItem('adminAccessToken', accessToken);
            localStorage.setItem('adminRefreshToken', refreshToken);
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try { await adminAuthAPI.logout(); } catch (e) { }
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
