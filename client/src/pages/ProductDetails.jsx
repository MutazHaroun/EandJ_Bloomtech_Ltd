import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Star, ShoppingBag, Minus, Plus, ChevronLeft, Leaf, Truck, ShieldCheck, RotateCcw, User, Heart } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, revRes] = await Promise.all([
                    API.get(`/products/${id}`),
                    API.get(`/reviews/product/${id}`)
                ]);
                setProduct(prodRes.data);
                setReviews(revRes.data);
            } catch (err) {
                toast.error('Failed to load product');
            }
            setLoading(false);
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        toast.success(`${quantity}x ${product.name} added to cart`);
    };

    const handleToggleWishlist = async () => {
    if (!user) return toast.error('Please log in to save items');
    try {
        if (isWishlisted) {
            // حذف من المفضلة
            await API.delete(`/wishlist/${id}`);
            setIsWishlisted(false);
            toast.info('Removed from wishlist');
        } else {
            // إضافة للمفضلة (تعديل productId إلى product_id هنا)
            await API.post('/wishlist', { product_id: id }); // تم التعديل لتطابق الـ Backend
            setIsWishlisted(true);
            toast.success('Added to wishlist! ❤️');
        }
    } catch (err) {
        console.error(err);
        toast.error('Error updating wishlist');
    }
};

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please log in to submit a review');
        try {
            const res = await API.post(
                `/reviews/product/${id}`,
                { rating, comment }
            );
            setReviews([{ ...res.data, user_name: user.name }, ...reviews]);
            setComment('');
            setRating(5);
            toast.success('Review submitted!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review');
        }
    };

    const renderStars = (count, size = 14) => (
        [...Array(5)].map((_, i) => (
            <Star key={i} size={size} className={i < count ? 'text-amber-400 fill-amber-400' : 'text-stone-200'} />
        ))
    );

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-stone-100 rounded-3xl animate-pulse" />
                    <div className="space-y-6 py-8">
                        <div className="h-4 bg-stone-100 rounded-full w-24 animate-pulse" />
                        <div className="h-10 bg-stone-100 rounded-full w-3/4 animate-pulse" />
                        <div className="h-6 bg-stone-100 rounded-full w-1/3 animate-pulse" />
                        <div className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="pb-32 lg:pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center space-x-2 text-sm">
                    <Link to="/shop" className="text-muted hover:text-forest transition flex items-center">
                        <ChevronLeft size={16} className="mr-1" /> Shop
                    </Link>
                    <span className="text-stone-300">/</span>
                    <span className="text-charcoal font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <div className="sticky top-28">
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 shadow-sm">
                                {product?.image_url || product?.image ? (
                                    <img
                                        src={product.image_url || product.image || ''}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://picsum.photos/600/600?random=1";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                                        <Leaf size={80} />
                                    </div>
                                )}
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-charcoal text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                    {product.category}
                                </span>
                                <button 
                                    onClick={handleToggleWishlist}
                                    className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${isWishlisted ? 'bg-terra text-white' : 'bg-white text-slate hover:text-terra'}`}
                                >
                                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col py-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex">{renderStars(Math.round(product.average_rating))}</div>
                            <span className="text-sm text-muted font-medium">
                                {product.average_rating > 0 ? `${product.average_rating} rating` : 'No ratings yet'} &bull; {reviews.length} reviews
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal leading-tight mb-4">{product.name}</h1>

                        <div className="flex items-baseline space-x-2 mb-6">
                            <span className="text-4xl font-extrabold text-forest">{parseInt(product.price).toLocaleString()}</span>
                            <span className="text-base font-bold text-muted">RWF</span>
                        </div>

                        <p className="text-slate leading-relaxed mb-8 text-base">{product.description || 'A premium product from our curated collection.'}</p>

                        <div className="mb-8">
                            {product.stock_quantity > 0 ? (
                                <div className="inline-flex items-center space-x-2 bg-sage/50 text-forest text-sm font-semibold px-4 py-2 rounded-full">
                                    <div className="w-2 h-2 bg-forest rounded-full animate-pulse" />
                                    <span>In Stock ({product.stock_quantity} available)</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-2 rounded-full">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    <span>Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {product.stock_quantity > 0 && (
                            <div className="flex flex-col space-y-4 mb-10">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center border-2 border-stone-200 rounded-2xl overflow-hidden bg-white">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-5 py-4 text-muted hover:bg-stone-50 transition"><Minus size={18} /></button>
                                        <span className="px-6 text-lg font-bold text-charcoal min-w-12 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} className="px-5 py-4 text-muted hover:bg-stone-50 transition"><Plus size={18} /></button>
                                    </div>

                                    <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center space-x-3 bg-forest hover:bg-forest-dark text-white py-4 px-8 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98]">
                                        <ShoppingBag size={20} />
                                        <span>Add to Cart — {(parseInt(product.price) * quantity).toLocaleString()} RWF</span>
                                    </button>
                                </div>
                                <button 
                                    onClick={handleToggleWishlist}
                                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all ${isWishlisted ? 'border-terra bg-terra/5 text-terra' : 'border-stone-100 text-slate hover:border-terra/30'}`}
                                >
                                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                                    {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-8">
                            {[{ icon: <Truck size={18} />, label: 'Free Delivery' }, { icon: <ShieldCheck size={18} />, label: 'Quality' }, { icon: <RotateCcw size={18} />, label: 'Easy Returns' }].map((g, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-sage/50 rounded-xl flex items-center justify-center text-forest shrink-0">{g.icon}</div>
                                    <p className="text-xs font-bold text-charcoal">{g.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="mt-24 max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-terra">Feedback</span>
                        <h2 className="text-3xl font-extrabold text-charcoal mt-2">Customer Reviews</h2>
                    </div>

                    {user && (
                        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleReviewSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 mb-10">
                            <h4 className="font-bold text-charcoal mb-6">Write a review</h4>
                            <div className="mb-5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-3">Your Rating</label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button key={num} type="button" onMouseEnter={() => setHoverRating(num)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(num)} className="p-1 transition-transform hover:scale-125">
                                            <Star size={24} className={`transition-colors ${(hoverRating || rating) >= num ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-3">Your Review</label>
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows="3" placeholder="Share your experience..." className="w-full px-5 py-4 bg-cream border border-stone-200 rounded-2xl text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition resize-none" />
                            </div>
                            <button type="submit" className="bg-charcoal hover:bg-forest text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors">Submit Review</button>
                        </motion.form>
                    )}

                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-12"><p className="text-muted font-medium">No reviews yet.</p></div>
                        ) : (
                            <AnimatePresence>
                                {reviews.map((review, idx) => (
                                    <motion.div key={review.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center"><User size={16} className="text-forest" /></div>
                                                <div>
                                                    <h5 className="font-bold text-charcoal text-sm">{review.user_name}</h5>
                                                    <div className="flex mt-0.5">{renderStars(review.rating, 12)}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted font-medium">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate text-sm leading-relaxed pl-13">{review.comment}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {product.stock_quantity > 0 && (
                <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-stone-200 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-muted font-medium">{product.name}</p>
                            <p className="text-xl font-extrabold text-forest">{parseInt(product.price).toLocaleString()} RWF</p>
                        </div>
                        <button onClick={handleAddToCart} className="bg-forest hover:bg-forest-dark text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg flex items-center space-x-2">
                            <ShoppingBag size={18} />
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ProductDetails;

