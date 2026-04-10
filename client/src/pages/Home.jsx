import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    ArrowRight, Leaf, TreePine, Wrench, Star, 
    ShoppingBag, Truck, ShieldCheck, Headphones, Heart 
} from 'lucide-react';
import API from '../api';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

// ════════════ ANIMATION VARIANTS ════════════
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const { addToCart } = useContext(CartContext);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await API.get('/products?limit=8');
                setFeatured(res.data.products);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchFeatured();
    }, []);

    const handleAdd = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(t('added_to_cart', { name: product.name }), {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: true,
            icon: <ShoppingBag size={18} className="text-forest" />
        });
    };

    return (
        <div className="bg-[#FCFDFB] selection:bg-forest/20 min-h-screen">
            
            {/* ════════════ 1. HERO SECTION ════════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-forest-light/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sage/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center w-full">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center space-x-2 bg-white shadow-sm border border-stone-100 px-4 py-2 rounded-full mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-forest"></span>
                            </span>
                            <span className="text-forest-dark text-xs font-bold uppercase tracking-[0.15em]">{t('hero_badge')}</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-charcoal leading-[0.9] mb-8 tracking-tighter">
                            {t('hero_title_part1')} <span className="text-forest italic font-serif">{t('hero_title_italic')}</span> <br />
                            {t('hero_title_part2')}
                        </h1>

                        <p className="text-xl text-charcoal/60 max-w-md mb-12 leading-relaxed font-medium">
                            {t('hero_description')}
                        </p>

                        <div className="flex flex-wrap gap-5">
                            <Link to="/shop" className="group bg-forest text-white px-10 py-5 rounded-[20px] font-bold flex items-center transition-all hover:bg-forest-dark hover:shadow-xl active:scale-95">
                                {t('shop_collection')} 
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link to="/track" className="bg-white text-charcoal border border-stone-200 px-10 py-5 rounded-[20px] font-bold hover:bg-stone-50 transition-all active:scale-95">
                                {t('track_order')}
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 2 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 rounded-[48px] overflow-hidden border-16 border-white shadow-2xl aspect-4/5 max-w-md ml-auto transition-transform duration-700 hover:rotate-0 bg-stone-200">
                            {/* 📸 الصورة الرئيسية: Bring life into your space */}
                            <img 
                                src="/IMG_0910.png" 
                                alt="E&J Nursery Main View" 
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                        </div>

                        <div className="absolute -bottom-10 -left-10 z-20 bg-white/90 backdrop-blur-xl p-8 rounded-4xl shadow-2xl border border-white/50 max-w-65">
                            <div className="flex -space-x-3 mb-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Customer" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-forest flex items-center justify-center text-[10px] text-white font-black">+2k</div>
                            </div>
                            <p className="text-sm font-bold text-charcoal leading-snug">{t('trust_badge_text')}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ════════════ 2. TRUST FEATURES ════════════ */}
            <section className="py-16 border-y border-stone-100 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: <Truck size={24} />, title: t('feature_1_title'), desc: t('feature_1_desc') },
                            { icon: <ShieldCheck size={24} />, title: t('feature_2_title'), desc: t('feature_2_desc') },
                            { icon: <Headphones size={24} />, title: t('feature_3_title'), desc: t('feature_3_desc') },
                            { icon: <Leaf size={24} />, title: t('feature_4_title'), desc: t('feature_4_desc') },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-5 group">
                                <div className="w-14 h-14 bg-sage/20 rounded-2xl flex items-center justify-center text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal text-sm uppercase tracking-wider">{feature.title}</h4>
                                    <p className="text-xs text-charcoal/50 font-medium mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

{/* ════════════ 3. CATEGORIES ROW ════════════ */}
<section className="py-24 max-w-7xl mx-auto px-6">
    <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-forest font-bold tracking-[0.3em] uppercase text-[10px] mb-4">{t('cat_subtitle')}</span>
        <h2 className="text-4xl md:text-5xl font-black text-charcoal tracking-tight">{t('cat_title')}</h2>
        <div className="h-1.5 w-16 bg-forest rounded-full mt-6" />
    </div>

    {/* التعديل: تقسيم الصف إلى 3 أعمدة متساوية md:grid-cols-3 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 📸 بطاقة الزهور */}
        <Link to="/shop?category=flowers" className="group relative rounded-[40px] overflow-hidden shadow-sm border border-stone-100 h-112.5 md:h-125">
            <img 
                src="/IMG_0938.png" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Flowers" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-black mb-2">{t('cat_flowers_title')}</h3>
                <div className="flex items-center font-bold text-sm group-hover:translate-x-2 transition-transform">
                    {t('explore')} <ArrowRight className="ml-2" size={16} />
                </div>
            </div>
        </Link>

        {/* 📸 بطاقة الأشجار */}
        <Link to="/shop?category=trees" className="group relative rounded-[40px] overflow-hidden shadow-sm border border-stone-100 h-112.5 md:h-125">
            <img 
                src="/IMG_0957.png" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Trees" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-black mb-2">{t('cat_trees_title')}</h3>
                <p className="text-white/60 text-sm font-medium">{t('cat_trees_desc')}</p>
            </div>
        </Link>
        
        {/* 📸 بطاقة الأدوات */}
        <Link to="/shop?category=tools" className="group relative rounded-[40px] overflow-hidden shadow-sm border border-stone-100 h-112.5 md:h-125">
            <img 
                src="/IMG_0984.png" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Tools" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-black mb-2">{t('cat_tools_title')}</h3>
                <p className="text-white/60 text-sm font-medium">{t('cat_tools_desc')}</p>
            </div>
        </Link>
    </div>
</section>
  {/* ════════════ 4. FEATURED PRODUCTS ════════════ */}
            <section className="py-32 bg-[#F8F9F7] rounded-[60px] lg:rounded-[100px]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                        <div className="mb-6 md:mb-0">
                            <span className="text-forest font-black tracking-[0.3em] uppercase text-[10px]">{t('featured_badge')}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-charcoal mt-4 tracking-tight">{t('featured_title')}</h2>
                        </div>
                        <Link to="/shop" className="group flex items-center font-bold text-charcoal hover:text-forest transition-colors text-lg">
                            {t('view_all_shop')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform text-forest" size={20} />
                        </Link>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {featured.map(product => (
                            <ProductCard key={product.id} product={product} onAdd={handleAdd} t={t} />
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

// ════════════ SUB-COMPONENT: PRODUCT CARD ════════════
const ProductCard = ({ product, onAdd, t }) => {
    return (
        <motion.div variants={fadeInUp} className="group">
            <div className="relative bg-white rounded-4xl overflow-hidden border border-stone-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="aspect-square overflow-hidden relative bg-stone-50">
                    <img 
                        src={product.image_url || 'https://picsum.photos/400/400?random=' + product.id} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={product.name} 
                    />
                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-charcoal hover:text-red-500 transition-colors shadow-sm">
                            <Heart size={20} />
                        </button>
                    </div>
                    <div className="absolute bottom-5 left-5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-forest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-stone-100">
                            {product.category}
                        </span>
                    </div>
                </div>
                <div className="p-7">
                    <div className="flex justify-between items-center mb-3">
                        {product.average_rating > 0 ? (
                            <div className="flex items-center text-amber-400 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Star size={10} className="fill-current" />
                                <span className="text-[10px] font-bold ml-1 text-amber-700">{product.average_rating}</span>
                            </div>
                        ) : <div className="h-4" />}
                    </div>
                    <h3 className="font-bold text-charcoal text-lg mb-5 truncate group-hover:text-forest transition-colors tracking-tight">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between border-t border-stone-50 pt-5">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-charcoal tracking-tighter">
                                {parseInt(product.price).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest">{t('currency_rwanda')}</span>
                        </div>
                        <button 
                            onClick={(e) => onAdd(product, e)}
                            className="w-14 h-14 bg-forest text-white rounded-[20px] flex items-center justify-center hover:bg-forest-dark transition-all shadow-xl shadow-forest/10 active:scale-90"
                        >
                            <ShoppingBag size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;

