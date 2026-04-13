import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { 
    User, Phone, MapPin, Package, Clock, CheckCircle, 
    Truck, XCircle, CreditCard, Edit2, Save, X, 
    ShoppingBag, Heart, ReceiptText, Download 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { t } = useTranslation(); // تفعيل الترجمة
    const { user, login } = useContext(AuthContext);
    const [profile, setProfile] = useState({});
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); // للتحكم في نافذة الإيصال
    
    const BASE_URL = 'https://eandj-bloomtech-ltd.onrender.com'; 
    
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileRes, ordersRes, wishlistRes] = await Promise.all([
                    API.get('/auth/me'),
                    API.get('/orders/me'),
                    API.get('/wishlist') 
                ]);
                
                setProfile(profileRes.data.user);
                setFormData({
                    name: profileRes.data.user.name || '',
                    phone: profileRes.data.user.phone || '',
                    address: profileRes.data.user.address || ''
                });
                setOrders(ordersRes.data || []);
                setWishlist(wishlistRes.data || []); 
            } catch (err) {
                console.error(err);
                toast.error(t('profile_load_error'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [t]);

    const handleSave = async () => {
        if (!formData.name) return toast.error(t('name_required_error'));
        setSaving(true);
        try {
            const res = await API.put('/auth/profile', formData);
            setProfile(res.data.user);
            setIsEditing(false);
            toast.success(t('profile_update_success'));
            const token = localStorage.getItem('token');
            if (token) login(token, res.data.user);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || t('profile_update_error'));
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'paid': return <CreditCard size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Package size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'paid': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-8 bg-stone-200 w-48 rounded mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 h-96 bg-stone-100 rounded-3xl" />
                    <div className="lg:col-span-2 h-96 bg-stone-100 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">{t('profile_title')}</h1>
                <p className="text-slate mt-2 font-medium">{t('profile_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ═══ Profile Details ═══ */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-charcoal">{t('profile_details_header')}</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="p-2 text-forest bg-sage/50 hover:bg-sage rounded-full transition-colors"><Edit2 size={16} /></button>
                            ) : (
                                <button onClick={() => { setIsEditing(false); setFormData({ name: profile.name, phone: profile.phone || '', address: profile.address || '' }); }} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"><X size={16} /></button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-forest flex items-center justify-center rounded-2xl shadow-md text-white text-2xl font-bold">
                                {profile.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-charcoal">{profile.name}</h3>
                                <p className="text-sm text-slate">{profile.email}</p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate uppercase mb-2">{t('full_name_label')}</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-forest/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate uppercase mb-2">{t('phone_label')}</label>
                                        <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-forest/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate uppercase mb-2">{t('address_label')}</label>
                                        <textarea rows="3" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-forest/20 resize-none" />
                                    </div>
                                    <button onClick={handleSave} disabled={saving} className="w-full bg-forest text-white py-3 rounded-xl font-bold hover:bg-forest-dark transition-all disabled:opacity-50">
                                        {saving ? t('saving_btn') : t('save_changes_btn')}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div key="view" className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <Phone size={18} className="text-slate mt-1" />
                                        <div><p className="text-sm font-bold text-slate">{t('phone_label')}</p><p className="text-charcoal">{profile.phone || t('not_provided')}</p></div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <MapPin size={18} className="text-slate mt-1" />
                                        <div><p className="text-sm font-bold text-slate">{t('address_label')}</p><p className="text-charcoal">{profile.address || t('not_provided')}</p></div>
                                    </div>
                                    <div className="pt-6 border-t border-stone-100 text-xs text-muted text-center">{t('member_since')} {new Date(profile.created_at).toLocaleDateString()}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ═══ Wishlist Section ═══ */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                        <div className="flex items-center gap-3 mb-6">
                            <Heart className="text-terra" size={24} fill="#E2725B" />
                            <h2 className="text-xl font-bold text-charcoal">{t('my_wishlist_header')}</h2>
                        </div>
                        {wishlist.length === 0 ? (
                            <p className="text-slate text-sm italic py-4">{t('wishlist_empty')}</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {wishlist.slice(0, 4).map(item => {
                                    const fileName = (item.image_url || item.image || "").replace(/^.*[\\\/]/, '');
                                    const imageSrc = `${BASE_URL}/uploads/${fileName}`;

                                    return (
                                        <Link key={item.wishlist_id} to={`/product/${item.product_id}`} className="relative group rounded-2xl overflow-hidden border border-stone-100 shadow-sm transition-transform hover:scale-[1.02] bg-stone-100">
                                            <div className="w-full h-28 overflow-hidden bg-stone-200">
                                                <img 
                                                    src={imageSrc} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://picsum.photos/seed/${item.product_id}/200/200`;
                                                    }}
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-white text-[10px] font-bold truncate">{item.name}</p>
                                                <p className="text-sage text-[9px] font-black">{parseInt(item.price).toLocaleString()} RWF</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Order History ═══ */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="text-forest" size={24} />
                            <h2 className="text-xl font-bold text-charcoal">{t('order_history_header')}</h2>
                        </div>
                        {orders.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <ShoppingBag size={32} className="text-muted mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-charcoal">{t('no_orders_yet')}</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-stone-100 rounded-2xl p-5 hover:bg-stone-50 transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center"><Package size={20} className="text-slate" /></div>
                                                <div><p className="text-xs font-bold text-slate uppercase mb-1">{t('order_date_label')}</p><p className="font-semibold text-charcoal">{new Date(order.created_at).toLocaleDateString()}</p></div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {t(`status_${order.status}`)}
                                                </span>
                                                <p className="text-lg font-black text-forest">{Number(order.total_amount).toLocaleString()} RWF</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-4">
                                                <p className="text-xs font-bold text-slate uppercase">ID: <span className="text-charcoal ml-1">{order.id.slice(-8).toUpperCase()}</span></p>
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-white bg-charcoal hover:bg-black px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                                >
                                                    <ReceiptText size={14} /> Receipt
                                                </button>
                                            </div>
                                            <Link to={`/track?code=${order.tracking_number}`} className="text-forest text-sm font-bold hover:underline">{t('track_package_link')} &rarr;</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ RECEIPT MODAL ═══ */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
                            onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Receipt Header */}
                            <div className="bg-stone-50 p-6 text-center border-b border-stone-200 border-dashed relative">
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors bg-white p-1 rounded-full shadow-sm"
                                >
                                    <X size={18} />
                                </button>
                                <div className="w-12 h-12 bg-forest mx-auto rounded-full flex items-center justify-center mb-3 shadow-md">
                                    <ReceiptText className="text-white" size={24} />
                                </div>
                                <h3 className="font-extrabold text-charcoal text-xl tracking-tight uppercase">E&J Bloomtech</h3>
                                <p className="text-xs text-muted font-mono mt-1">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                            </div>

                            {/* Receipt Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-3 mb-6 border-b border-stone-100 pb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted font-medium">Date</span>
                                        <span className="font-bold text-charcoal">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted font-medium">Customer</span>
                                        <span className="font-bold text-charcoal">{profile.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted font-medium">Status</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted font-medium">Tracking</span>
                                        <span className="font-mono font-bold text-forest text-xs">{selectedOrder.tracking_number}</span>
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">Purchased Items</h4>
                                <div className="space-y-4 mb-6">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-stone-400 font-bold text-xs">{item.quantity}x</span>
                                                    <span className="font-semibold text-sm text-charcoal max-w-[160px] truncate">{item.name}</span>
                                                </div>
                                                <span className="font-mono text-sm font-medium text-charcoal">
                                                    {(item.quantity * parseFloat(item.price_at_purchase)).toLocaleString()} 
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted text-xs italic">No item details available.</p>
                                    )}
                                </div>

                                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-muted font-medium">Subtotal</span>
                                        <span className="font-mono font-bold text-charcoal text-sm">{Number(selectedOrder.total_amount).toLocaleString()} RWF</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className="text-muted font-medium">Delivery</span>
                                        <span className="font-mono font-bold text-forest text-sm">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-stone-200 border-dashed pt-3 mt-1">
                                        <span className="font-extrabold text-charcoal text-base uppercase">Total</span>
                                        <span className="font-mono font-extrabold text-charcoal text-xl">{Number(selectedOrder.total_amount).toLocaleString()} RWF</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Receipt Footer */}
                            <div className="p-4 bg-charcoal text-center flex justify-center">
                                 <button onClick={() => window.print()} className="flex items-center justify-center gap-2 text-white hover:text-stone-200 text-sm font-bold transition-colors">
                                     <Download size={16} /> Print / Save as PDF
                                 </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
