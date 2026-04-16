import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { CartContext } from '../context/CartContext';
// تصحيح الخطأ هنا من lucide-center إلى lucide-react
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ChevronLeft, Leaf } from 'lucide-react';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } }
};
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const Cart = () => {
    const { t } = useTranslation(); // تفعيل الترجمة
    const { cart, removeFromCart, updateQuantity, cartSubtotal, cartTotal, cartCount, clearCart, discount, applyDiscount } = useContext(CartContext);
    const navigate = useNavigate();
    
    // Promo State
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');

    const handleApplyPromo = () => {
        if (promoInput.toUpperCase() === 'BLOOM10') {
            applyDiscount(0.10); // 10%
            setPromoError('');
            toast.success(t('promo_applied') || 'Promo code BLOOM10 applied! (10% off)');
        } else {
            applyDiscount(0);
            setPromoError(t('promo_invalid') || 'Invalid promo code');
            toast.error(t('promo_invalid') || 'Invalid promo code');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[65vh] text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-stone-300" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-charcoal mb-3">{t('cart_empty_title')}</h2>
                    <p className="text-muted font-medium mb-8 max-w-sm">{t('cart_empty_desc')}</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center bg-forest hover:bg-forest-dark text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        {t('browse_shop_btn')} <ArrowRight size={18} className="ml-2" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <Link to="/shop" className="text-sm text-muted hover:text-forest transition flex items-center mb-4">
                    <ChevronLeft size={16} className="mr-1" /> {t('continue_shopping_link')}
                </Link>
                <h1 className="text-4xl font-extrabold text-charcoal">{t('cart_title_page')}</h1>
                <p className="text-muted font-medium mt-1">
                    {cartCount === 1 
                        ? t('cart_count_summary', { count: cartCount }) 
                        : t('cart_count_summary_plural', { count: cartCount })}
                </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Items */}
                <div className="lg:w-2/3">
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                        <AnimatePresence>
                            {cart.map(cartItem => (
                                <motion.div
                                    key={cartItem.product_id}
                                    variants={item}
                                    layout
                                    exit={{ opacity: 0, x: -40 }}
                                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-100 flex flex-col sm:flex-row items-center gap-5"
                                >
                                    {/* Image */}
                                    <Link to={`/product/${cartItem.product_id}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0">
                                        {cartItem.image_url ? (
                                            <img src={cartItem.image_url} alt={cartItem.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                <Leaf size={28} />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <Link to={`/product/${cartItem.product_id}`} className="font-bold text-charcoal text-base hover:text-forest transition truncate block">
                                            {cartItem.name}
                                        </Link>
                                        <p className="text-forest font-bold text-sm mt-1">{parseInt(cartItem.price).toLocaleString()} {t('currency_each')}</p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white">
                                        <button onClick={() => updateQuantity(cartItem.product_id, cartItem.quantity - 1)} className="px-3.5 py-2.5 text-muted hover:text-charcoal hover:bg-stone-50 transition">
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-4 font-bold text-charcoal min-w-[2.5rem] text-center text-sm">{cartItem.quantity}</span>
                                        <button onClick={() => updateQuantity(cartItem.product_id, cartItem.quantity + 1)} className="px-3.5 py-2.5 text-muted hover:text-charcoal hover:bg-stone-50 transition">
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Subtotal + Remove */}
                                    <div className="flex items-center gap-4">
                                        <span className="font-extrabold text-charcoal text-base whitespace-nowrap">
                                            {(parseInt(cartItem.price) * cartItem.quantity).toLocaleString()} RWF
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(cartItem.product_id)}
                                            className="p-2.5 text-stone-400 hover:text-terra hover:bg-red-50 rounded-xl transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    <div className="mt-4 text-right">
                        <button onClick={clearCart} className="text-xs font-medium text-muted hover:text-terra transition">
                            {t('clear_cart_btn')}
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:w-1/3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="sticky top-28 bg-white rounded-2xl p-8 shadow-sm border border-stone-100"
                    >
                        <h3 className="font-bold text-charcoal text-lg mb-6 pb-4 border-b border-stone-100">{t('order_summary_title')}</h3>

                        {/* Promo Code Section */}
                        <div className="mb-6 pb-6 border-b border-stone-100">
                            <label className="text-xs font-bold uppercase text-muted mb-2 block">Promo Code</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value)}
                                    placeholder="e.g. BLOOM10"
                                    className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    className="bg-charcoal text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-forest transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            {promoError && <p className="text-xs text-terra font-semibold mt-2">{promoError}</p>}
                            {discount > 0 && <p className="text-xs text-forest font-semibold mt-2">10% discount applied!</p>}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">{t('subtotal_count_label', { count: cartCount })}</span>
                                <span className="font-semibold text-charcoal">{cartSubtotal.toLocaleString()} RWF</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Discount (10%)</span>
                                    <span className="font-semibold text-terra">-{ (cartSubtotal * discount).toLocaleString() } RWF</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">{t('delivery_kigali_label')}</span>
                                <span className="font-semibold text-forest">{t('free_label')}</span>
                            </div>
                        </div>

                        <div className="border-t border-stone-100 pt-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-charcoal">{t('total_label')}</span>
                                <span className="text-2xl font-extrabold text-charcoal">{cartTotal.toLocaleString()} RWF</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-forest hover:bg-forest-dark text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                        >
                            <span>{t('proceed_to_checkout_btn')}</span>
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default Cart;
