import { useState, useContext, useEffect } from 'react'; // إضافة useEffect
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ChevronLeft, ShoppingBag, CreditCard, CheckCircle, Phone, Loader2, Leaf, ShieldCheck } from 'lucide-react';

const Checkout = () => {
    const { t } = useTranslation(); // تفعيل الترجمة
    const { cart, cartSubtotal, cartTotal, discount, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=Review/Guest, 2=Payment, 3=Success
    const [loading, setLoading] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    
    // Guest info state
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    // إصلاح الخطأ: استخدام useEffect للتحقق من حالة السلة وتجنب الدوران اللانهائي
    useEffect(() => {
        if (cart.length === 0 && step !== 3) {
            navigate('/cart');
        }
    }, [cart, step, navigate]);

    // منع الرندر إذا كانت السلة فارغة ولم يكتمل الطلب بعد
    if (cart.length === 0 && step !== 3) {
        return null;
    }

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderPayload = { 
                items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) 
            };
            if (!user) {
                orderPayload.guest_email = guestEmail;
                orderPayload.guest_phone = guestPhone;
            }

            // 1. Create Order
            const orderRes = await API.post('/orders', orderPayload);
            const order_id = orderRes.data.order.id;

            // 2. Process MTN MoMo Payment
            toast.info(t('initiating_momo'), { autoClose: 2000 });

            const paymentRes = await API.post(
                '/payments/pay',
                { order_id, phone_number: user?.phone_number || user?.phone || guestPhone }
            );

           // تعديل التحقق ليتوافق مع رد السيرفر الحقيقي (pending) أو المحاكي (paid)
            if (paymentRes.data.status === 'paid' || paymentRes.data.status === 'pending') {
                
                // ✅ الحل هنا: جلب رقم التتبع من رد إنشاء الطلب (orderRes)
                const realTrackingNumber = orderRes.data.order.tracking_number || paymentRes.data.tracking_number;
                
                setTrackingNumber(realTrackingNumber || 'TRK-BLOOM-ERROR');
                
                clearCart();
                setStep(3);
                toast.success(t('payment_success_toast'));
            } else {
                toast.error(t('payment_failed_toast'));
            }
        } catch (err) {
            toast.error(err.response?.data?.error || t('checkout_failed_toast'));
        }
        setLoading(false);
    };

    // Step indicators
    const steps = [
        { num: 1, label: t('step_review'), icon: <ShoppingBag size={16} /> },
        { num: 2, label: t('step_payment'), icon: <CreditCard size={16} /> },
        { num: 3, label: t('step_confirmation'), icon: <CheckCircle size={16} /> },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
                {steps.map((s, idx) => (
                    <div key={s.num} className="flex items-center">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            step >= s.num
                                ? 'bg-forest text-white shadow-md'
                                : 'bg-stone-100 text-muted'
                        }`}>
                            {s.icon}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`w-8 sm:w-16 h-0.5 mx-2 transition-colors ${step > s.num ? 'bg-forest' : 'bg-stone-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ═══ STEP 1: Order Review ═══ */}
                {step === 1 && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
                            <h2 className="text-2xl font-extrabold text-charcoal mb-6">{t('review_order_title')}</h2>

                            {/* Items list */}
                            <div className="space-y-4 mb-8">
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-4 py-3 border-b border-stone-50 last:border-0">
                                        <div className="w-14 h-14 bg-stone-50 rounded-xl overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-200"><Leaf size={20} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-charcoal text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-muted">{t('qty_label')}: {item.quantity}</p>
                                        </div>
                                        <span className="font-bold text-charcoal text-sm whitespace-nowrap">
                                            {(parseInt(item.price) * item.quantity).toLocaleString()} RWF
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="bg-cream rounded-2xl p-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted">{t('subtotal_label')}</span>
                                    <span className="font-semibold text-charcoal">{cartSubtotal.toLocaleString()} RWF</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted">Discount</span>
                                        <span className="font-semibold text-terra">-{ (cartSubtotal * discount).toLocaleString() } RWF</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-muted">{t('delivery_label')}</span>
                                    <span className="font-semibold text-forest">{t('free_label')}</span>
                                </div>
                                <div className="border-t border-stone-200 pt-3 flex justify-between">
                                    <span className="font-bold text-charcoal">{t('total_label')}</span>
                                    <span className="text-2xl font-extrabold text-charcoal">{cartTotal.toLocaleString()} RWF</span>
                                </div>
                            </div>

                            {/* Delivery info */}
                            {user ? (
                                <div className="mt-6 bg-sage/30 rounded-2xl p-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('delivering_to_label')}</p>
                                    <p className="font-semibold text-charcoal">{user.name}</p>
                                    <p className="text-sm text-muted mt-0.5">{user.email}</p>
                                    {(!user.phone && !user.phone_number) && (
                                        <div className="mt-4">
                                            <label className="text-xs font-bold text-muted uppercase">Phone Number (MoMo)</label>
                                            <input type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest" placeholder="e.g. 0780000000" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-6 bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                                    <h3 className="font-bold text-charcoal text-sm mb-2">Guest Information</h3>
                                    <div>
                                        <label className="text-xs font-bold text-muted uppercase">Email Address</label>
                                        <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest" placeholder="e.g. hello@example.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted uppercase">Phone Number (MoMo)</label>
                                        <input type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest" placeholder="e.g. 0780000000" />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if(!user && (!guestEmail || !guestPhone)) {
                                        toast.error("Please fill in your guest information");
                                        return;
                                    }
                                    if(user && (!user.phone && !user.phone_number && !guestPhone)) {
                                        toast.error("Please provide a phone number for MoMo payment");
                                        return;
                                    }
                                    setStep(2);
                                }}
                                className="w-full mt-8 bg-forest hover:bg-forest-dark text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                {t('continue_to_payment_btn')}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 2: MTN MoMo Payment ═══ */}
                {step === 2 && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* MoMo Payment Card */}
                        <div className="bg-linear-to-br from-[#ffcc00] to-[#e6b800] rounded-3xl p-1 shadow-xl">
                            <div className="bg-white rounded-[20px] p-8">
                                {/* MoMo Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-[#ffcc00] rounded-xl flex items-center justify-center">
                                            <Phone size={22} className="text-[#003b6f]" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-charcoal text-lg">MTN Mobile Money</h3>
                                            <p className="text-xs text-muted">{t('momo_subtitle')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 bg-sage/50 px-3 py-1.5 rounded-full">
                                        <ShieldCheck size={14} className="text-forest" />
                                        <span className="text-[10px] font-bold text-forest uppercase">{t('secured_label')}</span>
                                    </div>
                                </div>

                                {/* Amount Display */}
                                <div className="bg-[#003b6f] rounded-2xl p-6 text-center mb-8">
                                    <p className="text-sm text-[#ffcc00] font-bold uppercase tracking-wider mb-1">{t('amount_to_pay_label')}</p>
                                    <p className="text-4xl font-extrabold text-white">{cartTotal.toLocaleString()} <span className="text-lg">RWF</span></p>
                                </div>

                                {/* Phone Confirmation (تم تغيير الإدخال إلى عرض الرقم التلقائي) */}
                                <div className="space-y-6">
                                    <div className="bg-cream border-2 border-stone-100 rounded-2xl p-6 text-center">
                                        <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-3">{t('momo_phone_label')}</label>
                                        <div className="flex items-center justify-center space-x-3 text-2xl font-extrabold text-charcoal">
                                            <span className="text-muted opacity-50">+250</span>
                                            <span>
                                                {(() => {
                                                    let num = user?.phone_number || user?.phone || guestPhone || "YOUR NUMBER";
                                                    if (num !== "YOUR NUMBER") {
                                                        num = num.replace(/\D/g, '');
                                                        if (num.startsWith('250')) num = num.substring(3);
                                                        if (num.startsWith('0')) num = num.substring(1);
                                                    }
                                                    return num;
                                                })()}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted mt-4 italic">*{t('momo_simulation_note')}</p>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center space-x-3 shadow-xl transition-all active:scale-[0.98] ${
                                            loading
                                                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                                : 'bg-[#ffcc00] hover:bg-[#e6b800] text-[#003b6f]'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                <span>{t('processing_payment_status')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Phone size={20} />
                                                <span>{t('pay_with_momo_btn')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full mt-4 text-center text-sm font-semibold text-muted hover:text-charcoal transition flex items-center justify-center space-x-1"
                                >
                                    <ChevronLeft size={14} />
                                    <span>{t('back_to_review_btn')}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 3: Success ═══ */}
                {step === 3 && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm border border-stone-100 text-center">
                            {/* Animated check */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-24 h-24 bg-forest rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
                            >
                                <CheckCircle size={48} className="text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-extrabold text-charcoal mb-3">{t('payment_success_title')}</h2>
                            <p className="text-muted font-medium max-w-md mx-auto mb-8">
                                {t('order_confirmed_desc')}
                            </p>

                            {/* Tracking Info */}
                            <div className="bg-sage/30 rounded-2xl p-6 max-w-sm mx-auto mb-10">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{t('your_tracking_number_label')}</p>
                                <p className="text-xl font-extrabold text-forest font-mono">{trackingNumber}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/track')}
                                    className="bg-forest hover:bg-forest-dark text-white px-8 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98]"
                                >
                                    {t('track_your_order_btn')}
                                </button>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="bg-cream hover:bg-stone-100 text-charcoal border border-stone-200 px-8 py-3.5 rounded-2xl font-bold transition-all"
                                >
                                    {t('continue_shopping_btn')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Checkout;
