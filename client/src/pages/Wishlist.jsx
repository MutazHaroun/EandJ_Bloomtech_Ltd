import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, useParams } from 'react-router-dom';
import API from '../api';
import { Heart, HeartOff, Trash2, ShoppingBag, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Wishlist = ({ shared = false }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { userId } = useParams();
    const [wishlist, setWishlist] = useState([]);
    const [sharedUserName, setSharedUserName] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchWishlist();
    }, [shared, userId]);

    const fetchWishlist = async () => {
        try {
            let res;
            if (shared) {
                res = await API.get(`/wishlist/shared/${userId}`);
                setSharedUserName(res.data.user_name || 'User');
                setWishlist(res.data.items || []);
            } else {
                res = await API.get('/wishlist');
                setWishlist(res.data || []);
            }
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
            toast.error(t('wishlist_remove_failed') || 'Error removing from wishlist');
        }
    };

    const handleShare = () => {
        const link = `${window.location.origin}/shared-wishlist/${user.id}`;
        navigator.clipboard.writeText(link);
        toast.success("Wishlist link copied to clipboard!");
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-charcoal tracking-tight mb-3">
                        {shared ? `${sharedUserName}'s Wishlist` : t('wishlist_title') || 'My Wishlist'}
                    </h1>
                    <p className="text-slate font-medium flex items-center gap-2">
                        <Heart size={18} className="text-terra" />
                        {wishlist.length} {wishlist.length === 1 ? t('item_label') || 'item' : t('items_label') || 'items'} {t('saved_label') || 'saved'}
                    </p>
                </div>
                {!shared && wishlist.length > 0 && (
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-charcoal font-bold rounded-2xl transition-all shadow-sm"
                    >
                        <Share2 size={18} />
                        Share Link
                    </button>
                )}
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100 border-dashed">
                    <HeartOff size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-xl font-bold text-charcoal mb-2">Your wishlist is empty</h3>
                    <p className="text-slate mb-6">Explore our shop and save your favorite items here.</p>
                    {!shared && (
                        <Link to="/shop" className="bg-forest text-white px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-forest-dark transition-colors">
                            <ShoppingBag size={18} /> Go Shopping
                        </Link>
                    )}
                </div>
            ) : (
                <motion.div 
                    initial="hidden" 
                    animate="show" 
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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
                                    {!shared && (
                                        <button 
                                            onClick={() => removeFromWishlist(item.product_id || item.id)}
                                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-400 hover:text-terra hover:bg-white transition-all shadow-sm"
                                            title="Remove from Wishlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

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
                            ))
                        }
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default Wishlist;
