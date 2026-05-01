import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../../services/api/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) { setCart(null); return; }
        setCartLoading(true);
        try {
            const res = await cartService.getCart();
            setCart(res.data);
        } catch {
            setCart(null);
        } finally {
            setCartLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, [user]);

    const addToCart = async (productId, quantity = 1) => {
        await cartService.addItem(productId, quantity);
        await fetchCart();
    };

    const updateItem = async (productId, quantity) => {
        await cartService.updateItem(productId, quantity);
        await fetchCart();
    };

    const removeItem = async (productId) => {
        await cartService.removeItem(productId);
        await fetchCart();
    };

    const clearCart = async () => {
        await cartService.clearCart();
        await fetchCart();
    };

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, cartLoading, addToCart, updateItem, removeItem, clearCart, itemCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);