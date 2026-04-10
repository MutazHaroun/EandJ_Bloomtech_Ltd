import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { 
    Search, Package, Truck, CheckCircle, Clock, 
    XCircle, Leaf, ArrowRight, MapPin, Phone, 
    Mail, HelpCircle, ChevronDown, Receipt, 
    AlertCircle, RefreshCcw, ExternalLink
} from 'lucide-react';
import API from '../api';
import { toast } from 'react-toastify';

// ════════════ ANIMATION VARIANTS ════════════
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const TrackOrder = () => {
    const { t } = useTranslation(); // تفعيل الترجمة
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderInfo, setOrderInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('status'); // 'status' | 'details'

    // ════════════ LOGIC ════════════

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!trackingNumber.trim()) return;

        setError('');
        setLoading(true);
        
        // محاكاة تأخير بسيط لتجربة مستخدم أفضل مع الأنييميشن
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // ✅ تم تعديل الرابط هنا من payments إلى orders
            const res = await API.get(`/orders/track/${trackingNumber.trim()}`);
            setOrderInfo(res.data);
            if (!res.data) setError(t('no_order_found'));
        } catch (err) {
            setError(t('track_error_msg'));
            setOrderInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        { key: 'pending', label: t('step_processing'), icon: <Clock size={20} />, desc: t('step_processing_desc') },
        { key: 'paid', label: t('step_ready'), icon: <Receipt size={20} />, desc: t('step_ready_desc') },
        { key: 'shipped', label: t('step_shipped'), icon: <Truck size={20} />, desc: t('step_shipped_desc') },
        { key: 'delivered', label: t('step_delivered'), icon: <Package size={20} />, desc: t('step_delivered_desc') },
    ];

    const getStepIndex = (status) => {
        const idx = statusSteps.findIndex(s => s.key === status);
        return idx >= 0 ? idx : 0;
    };

    // ════════════ SUB-COMPONENTS ════════════

    const SkeletonLoader = () => (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="h-40 bg-stone-100 rounded-4xl" />
            <div className="h-80 bg-stone-100 rounded-4xl" />
        </div>
    );

    const SupportSection = () => (
        <motion.div variants={fadeInUp} className="mt-16 bg-sage/20 rounded-[40px] p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-charcoal mb-2">{t('need_help_title')}</h3>
                    <p className="text-charcoal/60 text-sm max-w-sm">{t('need_help_desc')}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="https://wa.me/250xxxxxxx" className="flex items-center gap-2 bg-white text-forest px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all">
                        <Phone size={18} /> {t('whatsapp')}
                    </a>
                    <a href="mailto:support@bloom.rw" className="flex items-center gap-2 bg-forest text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-forest-dark transition-all">
                        <Mail size={18} /> {t('email_support')}
                    </a>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#FCFDFB] pb-24">
            
            {/* 1. HERO / SEARCH SECTION */}
            <section className="pt-32 pb-16 px-6 bg-white border-b border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-forest-light/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                        <div className="inline-flex items-center gap-2 bg-sage/30 text-forest px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <Leaf size={14} /> <span>{t('logistics_portal')}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-charcoal tracking-tighter mb-6 leading-[0.9]">
                            {t('track_hero_title')} <br /><span className="text-forest italic font-serif">{t('track_hero_italic')}</span>
                        </h1>
                        <p className="text-charcoal/50 text-lg font-medium max-w-lg mx-auto mb-10">
                            {t('track_hero_desc')}
                        </p>
                    </motion.div>

                    <motion.form 
                        onSubmit={handleTrack}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <div className="bg-white rounded-[28px] p-2 shadow-2xl shadow-forest/10 border border-stone-100 flex flex-col md:flex-row items-stretch gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
                                <input 
                                    type="text" 
                                    placeholder="TRK-KGL-XXXX-XXXX"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                    className="w-full pl-14 pr-6 py-5 bg-transparent text-charcoal font-black placeholder:text-stone-300 focus:outline-none"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-forest text-white px-10 py-5 rounded-[22px] font-black text-sm uppercase tracking-widest hover:bg-forest-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? <RefreshCcw className="animate-spin" size={20} /> : <><><Truck size={20} /> {t('track_now_btn')}</></>}
                            </button>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2 text-red-500 font-bold text-sm"
                                >
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.form>
                </div>
            </section>

            {/* 2. RESULTS SECTION */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <SkeletonLoader />
                    ) : orderInfo ? (
                        <motion.div 
                            initial="hidden" 
                            animate="visible" 
                            variants={staggerContainer}
                            className="space-y-8"
                        >
                            {/* Order Quick Summary Card */}
                            <motion.div variants={fadeInUp} className="bg-white rounded-[40px] border border-stone-100 shadow-sm p-8 md:p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Leaf size={120} />
                                </div>
                                
                                <div className="flex flex-wrap justify-between items-start gap-8 relative z-10">
                                    <div>
                                        <p className="text-xs font-black uppercase text-muted tracking-widest mb-2">{t('order_id_label')}</p>
                                        <h2 className="text-3xl font-black text-charcoal font-mono">{orderInfo.tracking_number}</h2>
                                        <p className="text-sm text-forest font-bold mt-2 flex items-center gap-2">
                                            <CheckCircle size={14} /> {t('confirmed_on', { date: new Date(orderInfo.created_at).toLocaleDateString() })}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs font-black uppercase text-muted tracking-widest mb-2">{t('total_investment')}</p>
                                        <h2 className="text-3xl font-black text-forest">
                                            {parseInt(orderInfo.total_amount).toLocaleString()} <span className="text-xs">RWF</span>
                                        </h2>
                                        <div className="mt-2 inline-flex bg-stone-100 rounded-full p-1">
                                            <button 
                                                onClick={() => setActiveTab('status')}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeTab === 'status' ? 'bg-white shadow-sm text-charcoal' : 'text-muted'}`}
                                            >
                                                {t('tab_status')}
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('details')}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeTab === 'details' ? 'bg-white shadow-sm text-charcoal' : 'text-muted'}`}
                                            >
                                                {t('tab_details')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 h-px bg-stone-100 w-full" />

                                {/* Tab Content 1: Status Timeline */}
                                {activeTab === 'status' && (
                                    <div className="mt-12">
                                        {orderInfo.status === 'cancelled' ? (
                                            <div className="flex flex-col items-center py-10 text-center">
                                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                                    <XCircle size={40} />
                                                </div>
                                                <h3 className="text-xl font-black text-charcoal">{t('order_cancelled_title')}</h3>
                                                <p className="text-muted text-sm max-w-xs mt-2">{t('order_cancelled_desc')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0 relative">
                                                {statusSteps.map((step, idx) => {
                                                    const currentIdx = getStepIndex(orderInfo.status);
                                                    const isDone = idx <= currentIdx;
                                                    const isNow = idx === currentIdx;

                                                    return (
                                                        <div key={step.key} className="flex gap-6 items-start relative pb-10 last:pb-0">
                                                            {/* Vertical Line */}
                                                            {idx !== statusSteps.length - 1 && (
                                                                <div className={`absolute left-7 top-14 w-0.5 h-full ${idx < currentIdx ? 'bg-forest' : 'bg-stone-100'}`} />
                                                            )}
                                                            
                                                            <motion.div 
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center z-10 transition-all duration-500 ${
                                                                    isDone ? 'bg-forest text-white shadow-xl shadow-forest/20' : 'bg-stone-50 text-stone-300 border border-stone-100'
                                                                } ${isNow ? 'ring-8 ring-forest/10' : ''}`}
                                                            >
                                                                {isDone && !isNow ? <CheckCircle size={24} /> : step.icon}
                                                            </motion.div>

                                                            <div className="pt-2">
                                                                <h4 className={`text-lg font-black tracking-tight ${isDone ? 'text-charcoal' : 'text-stone-300'}`}>
                                                                    {step.label}
                                                                    {isNow && <span className="ml-3 text-[9px] bg-forest/10 text-forest px-2 py-1 rounded-md align-middle">{t('tag_current')}</span>}
                                                                </h4>
                                                                <p className={`text-sm mt-1 font-medium ${isDone ? 'text-charcoal/50' : 'text-stone-200'}`}>
                                                                    {step.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab Content 2: Order Details */}
                                {activeTab === 'details' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 grid md:grid-cols-2 gap-12">
                                        {/* Address Block */}
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-muted tracking-widest mb-6 flex items-center gap-2">
                                                <MapPin size={14} className="text-forest" /> {t('delivery_location')}
                                            </h4>
                                            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                                                <p className="font-black text-charcoal mb-1">{t('kigali_rwanda')}</p>
                                                <p className="text-sm text-charcoal/60 leading-relaxed font-medium">
                                                    {t('address_placeholder')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items Block */}
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-muted tracking-widest mb-6 flex items-center gap-2">
                                                <Package size={14} className="text-forest" /> {t('items_list')}
                                            </h4>
                                            <div className="space-y-4">
                                                {/* عرض المنتجات الحقيقية من الـ API */}
                                                {orderInfo.items && orderInfo.items.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-4 group">
                                                        <div className="w-16 h-16 bg-stone-100 rounded-2xl overflow-hidden shrink-0 border border-stone-200">
                                                            <img src={item.image_url || "https://images.unsplash.com/photo-1517576497829-1a13fe38a6ec?w=200"} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-charcoal text-sm leading-tight">{item.name}</p>
                                                            <p className="text-xs text-muted font-bold mt-1">{item.quantity} unit{item.quantity > 1 ? 's' : ''}</p>
                                                        </div>
                                                        <p className="font-black text-forest text-sm italic">{t(`status_${orderInfo.status}`)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Additional FAQ Section */}
                            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-4xl border border-stone-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                        <HelpCircle size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-charcoal mb-2">{t('wrong_address_title')}</h5>
                                        <p className="text-xs text-muted leading-relaxed font-medium">{t('wrong_address_desc')}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-4xl border border-stone-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-charcoal mb-2">{t('courier_info_title')}</h5>
                                        <p className="text-xs text-muted leading-relaxed font-medium">{t('courier_info_desc')}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <SupportSection />
                        </motion.div>
                    ) : (
                        /* Empty State */
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-center py-20 bg-white rounded-[48px] border border-stone-100 shadow-sm"
                        >
                            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-stone-300" />
                            </div>
                            <h3 className="text-2xl font-black text-charcoal tracking-tight">{t('ready_to_track_title')}</h3>
                            <p className="text-muted text-sm max-w-xs mx-auto mt-2">{t('ready_to_track_desc')}</p>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* 3. FOOTER INFO */}
            <footer className="max-w-4xl mx-auto px-6 text-center">
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Leaf size={10} className="text-forest" /> {t('powered_by_logistics')}
                </p>
            </footer>
        </div>
    );
};

export default TrackOrder;
