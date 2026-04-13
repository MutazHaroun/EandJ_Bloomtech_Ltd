import { useState, useEffect } from 'react';
import API from '../api';
import { Heart, HeartOff, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { t } = useTranslation();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const BASE_URL = 'https://eandj-bloomtech-ltd.onrender.com';

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await API.get('/wishlist');
            setWishlist(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error(t('wishlist_load_error') || 'Error loading wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await API.delete(`/wishlist/${productId}`);
            setWishlist(prev => prev.filter(item => (item.product_id || item.id) !== productId));
            toast.success(t('wishlist_remove_success') || 'Removed from wishlist');
        } catch (err) {
            console.error(err);
            toast.error(t('wishlist_remove_error') || 'Error removing from wishlist');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-10 bg-stone-200 w-64 rounded mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-stone-100 rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-6">
                <div className="w-12 h-12 bg-red-50 text-terra rounded-full flex items-center justify-center">
                    <Heart size={24} fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">My Wishlist</h1>
                    <p className="text-slate font-medium">{wishlist.length} items saved</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100 border-dashed">
                    <HeartOff size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-xl font-bold text-charcoal mb-2">Your wishlist is empty</h3>
                    <p className="text-slate mb-6">Explore our shop and save your favorite items here.</p>
                    <Link to="/shop" className="bg-forest text-white px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-forest-dark transition-colors">
                        <ShoppingBag size={18} /> Go Shopping
                    </Link>
                </div>
            ) : (
                <motion.div 
                    initial="hidden" 
                    animate="show" 
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 shrink-0"
                >
                    <AnimatePresence>
                        {wishlist.map(item => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col"
                                >
                                    <button 
                                        onClick={() => removeFromWishlist(item.product_id || item.id)}
                                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-400 hover:text-terra hover:bg-white transition-all shadow-sm"
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <Link to={`/product/${item.product_id || item.id}`} className="block flex-1 flex flex-col h-full">
                                        <div className="h-48 relative bg-stone-100 overflow-hidden w-full">
                                            <img 
                                                src={item.image_url || `https://picsum.photos/seed/${item.product_id || item.id}/300/300`} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://picsum.photos/seed/${item.product_id || item.id}/300/300`;
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-charcoal text-sm mb-1 line-clamp-2">{item.name}</h3>
                                            <p className="font-black text-forest text-lg mt-auto">{parseInt(item.price).toLocaleString()} RWF</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default Wishlist;
