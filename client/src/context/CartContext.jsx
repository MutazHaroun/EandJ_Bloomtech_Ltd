import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

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
