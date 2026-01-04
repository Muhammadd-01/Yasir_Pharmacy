import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [], totalItems: 0, totalAmount: 0 });
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const response = await cartAPI.get();
            setCart(response.data.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            return { success: false, requiresAuth: true };
        }

        try {
            setLoading(true);
            const response = await cartAPI.add(productId, quantity);
            setCart(response.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to add to cart'
            };
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            setLoading(true);
            const response = await cartAPI.update(productId, quantity);
            setCart(response.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update cart'
            };
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            setLoading(true);
            const response = await cartAPI.remove(productId);
            setCart(response.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to remove item'
            };
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            await cartAPI.clear();
            setCart({ items: [], totalItems: 0, totalAmount: 0 });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to clear cart'
            };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
