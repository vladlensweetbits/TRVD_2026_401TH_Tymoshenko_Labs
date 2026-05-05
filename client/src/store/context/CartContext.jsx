import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../../services/api/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'guestCart';

const getGuestCart = () => {
    try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        return stored ? JSON.parse(stored) : { items: [] };
    } catch {
        return { items: [] };
    }
};

const saveGuestCart = (cart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) {
            setCart(getGuestCart());
            return;
        }
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

    const addToCart = async (productId, quantity = 1, productData = null) => {
        if (!user) {
            const guestCart = getGuestCart();
            const existing = guestCart.items.findIndex(i =>
                (i.product?._id || i.product?.id) === productId
            );
            if (existing >= 0) {
                guestCart.items[existing].quantity += quantity;
            } else {
                if (!productData) return;
                guestCart.items.push({
                    product: {
                        _id: productData._id || productData.id,
                        name: productData.name,
                        price: productData.price,
                        images: productData.images || [],
                    },
                    quantity,
                    price: productData.price,
                });
            }
            saveGuestCart(guestCart);
            setCart({ ...guestCart });
            return;
        }
        await cartService.addItem(productId, quantity);
        await fetchCart();
    };

    const updateItem = async (productId, quantity) => {
        if (!user) {
            const guestCart = getGuestCart();
            const idx = guestCart.items.findIndex(i =>
                (i.product?._id || i.product?.id) === productId
            );
            if (idx >= 0) {
                if (quantity <= 0) guestCart.items.splice(idx, 1);
                else guestCart.items[idx].quantity = quantity;
            }
            saveGuestCart(guestCart);
            setCart({ ...guestCart });
            return;
        }
        await cartService.updateItem(productId, quantity);
        await fetchCart();
    };

    const removeItem = async (productId) => {
        if (!user) {
            const guestCart = getGuestCart();
            guestCart.items = guestCart.items.filter(i =>
                (i.product?._id || i.product?.id) !== productId
            );
            saveGuestCart(guestCart);
            setCart({ ...guestCart });
            return;
        }
        await cartService.removeItem(productId);
        await fetchCart();
    };

    const clearCart = async () => {
        if (!user) {
            const emptyCart = { items: [] };
            saveGuestCart(emptyCart);
            setCart(emptyCart);
            return;
        }
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