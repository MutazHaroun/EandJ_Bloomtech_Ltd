import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import API from '../api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0); 

    // Used to avoid excessive API calls
    const initializedRef = useRef(false);

    // Initial load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try { setCart(JSON.parse(saved)); } 
            catch(err) { console.error("Error parsing cart data"); }
        }
    }, []);

    // Load from cloud when user logs in
    useEffect(() => {
        if (user) {
            API.get('/cart').then(res => {
                if(res.data.cart && res.data.cart.length > 0) {
                    setCart(res.data.cart);
                }
                initializedRef.current = true;
            }).catch(err => {
                console.error("Cart sync error", err);
                initializedRef.current = true;
            });
        } else {
            initializedRef.current = true;
        }
    }, [user]);

    // Save to local storage or cloud
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Sync to cloud if logged in
        if (user && initializedRef.current) {
            const timeoutId = setTimeout(() => {
                API.post('/cart/sync', { cart }).catch(console.error);
            }, 1000); // 1-second debounce
            return () => clearTimeout(timeoutId);
        }
    }, [cart, user]);

    const applyDiscount = (percent) => {
        setDiscount(percent);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item.product_id === product.id);
            if (exists) {
                return prev.map(item => 
                    item.product_id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(item => 
            item.product_id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
    };

    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = cartSubtotal - (cartSubtotal * discount);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartSubtotal, cartTotal, cartCount, discount, applyDiscount }}>
            {children}
        </CartContext.Provider>
    );
};
