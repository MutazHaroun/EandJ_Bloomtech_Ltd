import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-stone-200">
                            <div className="flex items-center space-x-3">
                                <ShoppingBag size={22} className="text-forest" />
                                <h2 className="text-lg font-bold text-charcoal">Your Cart</h2>
                                <span className="bg-forest text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{cartCount}</span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 text-muted transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag size={32} className="text-stone-300" />
                                    </div>
                                    <p className="text-muted font-medium mb-1">Your cart is empty</p>
                                    <p className="text-sm text-muted/60">Start adding some greenery!</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {cart.map(item => (
                                        <motion.div 
                                            key={item.product_id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center gap-4"
                                        >
                                            <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No img</div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-charcoal text-sm truncate">{item.name}</h4>
                                                <p className="text-forest font-bold text-sm mt-0.5">{parseInt(item.price).toLocaleString()} RWF</p>
                                                
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-stone-400 hover:text-terra hover:bg-red-50 rounded-lg transition shrink-0">
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <div className="border-t border-stone-200 p-6 space-y-4 bg-white">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted font-medium">Subtotal</span>
                                    <span className="text-xl font-extrabold text-charcoal">{cartTotal.toLocaleString()} RWF</span>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="w-full bg-forest hover:bg-forest-dark text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                >
                                    <span>Checkout</span>
                                    <ArrowRight size={18} />
                                </button>
                                <button onClick={clearCart} className="w-full text-center text-xs font-medium text-muted hover:text-terra transition">
                                    Clear entire cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
export default CartDrawer;
