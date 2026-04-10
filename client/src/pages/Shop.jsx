import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { 
    Search, ShoppingBag, Star, Leaf, TreePine, Wrench, 
    SlidersHorizontal, X, LayoutGrid, List, ChevronRight, 
    ChevronLeft, ArrowUpDown, Eye, Heart, Info, CheckCircle2, 
    AlertCircle, RotateCcw, Filter, PackageCheck, Zap
} from 'lucide-react';
import API from '../api';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

// ════════════ ANIMATION CONFIG ════════════
const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
        opacity: 1, 
        transition: { staggerChildren: 0.08, delayChildren: 0.2 } 
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    closed: { x: '-100%', opacity: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
};

// ════════════ MAIN COMPONENT ════════════
const Shop = () => {
    const { t } = useTranslation(); // تفعيل هوك الترجمة
    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // --- Filter States ---
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState(100000); // Max Price Limit
    const [minRating, setMinRating] = useState(0);
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high, rating
    
    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    // 1. Initial Load & URL Sync
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('category');
        if (cat) setCategory(cat);
        
        window.scrollTo(0, 0);
        fetchInitialData();
    }, [location.search]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/products?limit=100'); // جلب كمية كبيرة للفلترة الأمامية
            setProducts(res.data.products);
        } catch (err) {
            toast.error(t('error_nursery_db'));
        } finally {
            setLoading(false);
        }
    };

    // 2. Advanced Filtering Logic (Client Side for speed)
    useEffect(() => {
        let result = [...products];

        // Search Filter
        if (search) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                p.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Category Filter
        if (category) {
            result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        // Price Filter
        result = result.filter(p => parseInt(p.price) <= priceRange);

        // Rating Filter
        if (minRating > 0) {
            result = result.filter(p => p.average_rating >= minRating);
        }

        // Stock Filter
        if (onlyInStock) {
            result = result.filter(p => p.stock_quantity > 0);
        }

        // Sorting Logic
        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'rating': result.sort((a, b) => b.average_rating - a.average_rating); break;
            default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredProducts(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [products, search, category, priceRange, minRating, onlyInStock, sortBy]);

    // 3. Pagination Calculations
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // 4. Event Handlers
    const handleAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock_quantity === 0) return;
        addToCart(product);
        toast.success(t('ready_for_garden', { name: product.name }));
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setPriceRange(100000);
        setMinRating(0);
        setOnlyInStock(false);
        setSortBy('newest');
    };

    // 5. Shared UI Data
    const categories = [
        { id: 'all', value: '', label: t('cat_all'), icon: <LayoutGrid size={16} /> },
        { id: 'flw', value: 'flowers', label: t('cat_flowers'), icon: <Leaf size={16} /> },
        { id: 'tre', value: 'trees', label: t('cat_trees'), icon: <TreePine size={16} /> },
        { id: 'tol', value: 'tools', label: t('cat_tools'), icon: <Wrench size={16} /> },
    ];

    // ════════════ COMPONENT PARTS ════════════

    // --- Filter Sidebar Content ---
    const FilterSidebar = () => (
        <div className="flex flex-col h-full">
            <div className="space-y-10 py-2">
                {/* Categories */}
                <section>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-forest mb-5 flex items-center">
                        <Filter size={14} className="mr-2" /> {t('filter_categories')}
                    </h4>
                    <div className="grid gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.value)}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    category === cat.value 
                                    ? 'bg-forest text-white shadow-lg shadow-forest/20' 
                                    : 'bg-white text-slate hover:bg-sage/30 border border-stone-100'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    {cat.icon} {cat.label}
                                </span>
                                {category === cat.value && <CheckCircle2 size={14} />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Price Slider */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-forest flex items-center">
                            <Zap size={14} className="mr-2" /> {t('max_price')}
                        </h4>
                        <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-1 rounded">
                            {priceRange.toLocaleString()} RWF
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="500" 
                        max="100000" 
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-forest"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-muted">
                        <span>500 RWF</span>
                        <span>100K RWF</span>
                    </div>
                </section>

                {/* Availability */}
                <section>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-forest mb-4">{t('availability')}</h4>
                    <label className="relative flex items-center group cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={onlyInStock}
                            onChange={() => setOnlyInStock(!onlyInStock)}
                        />
                        <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:bg-forest transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        <span className="ml-3 text-sm font-bold text-slate group-hover:text-forest transition-colors">{t('in_stock_only')}</span>
                    </label>
                </section>

                {/* Rating Filter */}
                <section>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-forest mb-4">{t('min_rating')}</h4>
                    <div className="flex gap-2">
                        {[4, 3, 2].map(star => (
                            <button
                                key={star}
                                onClick={() => setMinRating(minRating === star ? 0 : star)}
                                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                                    minRating === star ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-stone-200 text-slate hover:border-amber-400'
                                }`}
                            >
                                <Star size={14} className={minRating === star ? 'fill-white' : 'fill-amber-400 text-amber-400'} />
                                {star}+
                            </button>
                        ))}
                    </div>
                </section>

                <button 
                    onClick={resetFilters}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-stone-100 text-muted font-bold text-sm hover:bg-stone-200 transition-all active:scale-95"
                >
                    <RotateCcw size={16} /> {t('reset_filters')}
                </button>
            </div>
        </div>
    );

    // ════════════ MAIN RENDER ════════════
    return (
        <div className="min-h-screen bg-[#FCFDFB]">
            
            {/* 1. Header & Breadcrumbs */}
            <header className="bg-white border-b border-stone-100 pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <nav className="flex items-center space-x-2 text-xs font-bold text-muted uppercase tracking-widest mb-4">
                                <Link to="/" className="hover:text-forest transition-colors">{t('home')}</Link>
                                <ChevronRight size={12} />
                                <span className="text-forest">{t('shop')}</span>
                            </nav>
                            <h1 className="text-5xl font-black text-charcoal tracking-tighter">
                                {t('discover_part1')} <span className="text-forest italic font-serif">{t('discover_part2')}</span>
                            </h1>
                        </motion.div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input 
                                    type="text" 
                                    placeholder={t('search_placeholder_shop')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-forest/10 focus:border-forest transition-all font-medium"
                                />
                            </div>
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-4 bg-white border border-stone-200 rounded-2xl hover:border-forest transition-colors"
                            >
                                <SlidersHorizontal size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Desktop Sidebar (Left) */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-32">
                            <FilterSidebar />
                            {/* Special Banner */}
                            <div className="mt-12 bg-forest-dark rounded-4xl p-8 text-white relative overflow-hidden">
                                <PackageCheck className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24" />
                                <h5 className="font-bold text-xl mb-2 relative z-10">{t('care_guides_title')}</h5>
                                <p className="text-white/60 text-xs mb-6 relative z-10 leading-relaxed">
                                    {t('care_guides_desc')}
                                </p>
                                <button className="w-full bg-white text-forest-dark py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sage transition-all relative z-10">
                                    {t('read_blog')}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Content Section (Right) */}
                    <div className="flex-1">
                        
                        {/* Sort & Controls Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-white p-4 rounded-3xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="flex bg-stone-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-forest' : 'text-muted hover:text-charcoal'}`}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-forest' : 'text-muted hover:text-charcoal'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                                <span className="text-sm font-bold text-muted italic">
                                    {t('showing_results', { count: filteredProducts.length })}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline text-xs font-black uppercase text-muted tracking-widest">{t('sort_by_label')}</span>
                                <div className="relative">
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-stone-50 border border-stone-100 rounded-xl px-6 py-2.5 pr-10 text-sm font-bold text-charcoal focus:ring-2 focus:ring-forest/10 transition-all cursor-pointer"
                                    >
                                        <option value="newest">{t('sort_newest')}</option>
                                        <option value="price-low">{t('sort_price_low')}</option>
                                        <option value="price-high">{t('sort_price_high')}</option>
                                        <option value="rating">{t('sort_rating')}</option>
                                    </select>
                                    <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                {[...Array(6)].map((_, i) => <SkeletonCard key={i} mode={viewMode} />)}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <EmptyState onReset={resetFilters} t={t} />
                        ) : (
                            /* Products Grid/List */
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className={`grid gap-8 ${
                                    viewMode === 'grid' 
                                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                                    : 'grid-cols-1'
                                }`}
                            >
                                <AnimatePresence mode="popLayout">
                                    {currentProducts.map(product => (
                                        <ProductItem 
                                            key={product.id} 
                                            product={product} 
                                            mode={viewMode} 
                                            onAdd={handleAddToCart} 
                                            t={t}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* Pagination Area */}
                        {filteredProducts.length > productsPerPage && (
                            <div className="mt-20 flex justify-center items-center gap-3">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-4 rounded-2xl bg-white border border-stone-200 text-charcoal hover:border-forest disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-forest text-white shadow-xl shadow-forest/20' 
                                                : 'bg-white border border-stone-200 text-slate hover:bg-stone-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-4 rounded-2xl bg-white border border-stone-200 text-charcoal hover:border-forest disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* 3. Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-100 lg:hidden"
                        />
                        <motion.div 
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-101 shadow-2xl lg:hidden p-8 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-charcoal">{t('filters_title')}</h3>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-stone-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <FilterSidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// ════════════ SUB-COMPONENTS ════════════

const ProductItem = ({ product, mode, onAdd, t }) => {
    if (mode === 'list') {
        return (
            <motion.div 
                variants={itemVariants}
                layout
                className="group relative bg-white border border-stone-100 rounded-4xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:shadow-forest/5 transition-all duration-500"
            >
                <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden shrink-0 bg-stone-50">
                    <img src={product.image_url || 'https://picsum.photos/400/400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                </div>
                <div className="flex-1 py-2">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-forest bg-forest/5 px-3 py-1.5 rounded-lg">{product.category}</span>
                        {product.average_rating > 0 && (
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">
                                <Star size={12} className="fill-current" />
                                <span className="text-xs font-black">{product.average_rating}</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-charcoal mb-4 group-hover:text-forest transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted line-clamp-2 mb-6 font-medium leading-relaxed">
                        {t('product_description_placeholder', { name: product.name })}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-charcoal tracking-tighter">{parseInt(product.price).toLocaleString()} <span className="text-xs text-muted font-bold">RWF</span></span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${product.stock_quantity > 0 ? 'text-forest' : 'text-red-500'}`}>
                                {product.stock_quantity > 0 ? t('in_stock_count', { count: product.stock_quantity }) : t('out_of_stock')}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-4 bg-stone-100 text-slate rounded-2xl hover:bg-stone-200 transition-all"><Heart size={20} /></button>
                            <button 
                                onClick={(e) => onAdd(product, e)}
                                disabled={product.stock_quantity === 0}
                                className="px-8 py-4 bg-forest text-white rounded-2xl font-black flex items-center gap-3 hover:bg-forest-dark transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-forest/10"
                            >
                                <ShoppingBag size={20} /> {t('add_to_cart')}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={itemVariants} layout className="group">
            <div className="relative bg-white rounded-[40px] overflow-hidden border border-stone-100 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2">
                <Link to={`/product/${product.id}`} className="block relative aspect-10/11 overflow-hidden bg-stone-50">
                    <img src={product.image_url || 'https://picsum.photos/400/400?v=' + product.id} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-charcoal shadow-sm border border-white/50">{product.category}</span>
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                            <span className="bg-terra text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">{t('low_stock')}</span>
                        )}
                    </div>

                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-6 left-6 right-6 flex gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                        <button className="flex-1 bg-white/90 backdrop-blur-md py-3 rounded-2xl text-charcoal font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest hover:text-white transition-all">
                            <Eye size={16} /> {t('quick_view')}
                        </button>
                        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-charcoal hover:text-red-500 transition-colors">
                            <Heart size={18} />
                        </button>
                    </div>
                </Link>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-charcoal text-lg truncate group-hover:text-forest transition-colors flex-1">{product.name}</h3>
                        {product.average_rating > 0 && (
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star size={14} className="fill-current" />
                                <span className="text-xs font-black">{product.average_rating}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-stone-50 pt-6 mt-4">
                        <span className="text-2xl font-black text-charcoal tracking-tighter">{parseInt(product.price).toLocaleString()} <span className="text-[10px] text-muted">RWF</span></span>
                        <button 
                            onClick={(e) => onAdd(product, e)}
                            disabled={product.stock_quantity === 0}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                                product.stock_quantity > 0 
                                ? 'bg-forest text-white hover:bg-forest-dark shadow-forest/10' 
                                : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <ShoppingBag size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = ({ mode }) => (
    <div className={`bg-white rounded-[40px] overflow-hidden border border-stone-100 animate-pulse ${mode === 'list' ? 'flex flex-row p-6 gap-8' : ''}`}>
        <div className={`bg-stone-100 ${mode === 'list' ? 'w-64 aspect-square rounded-2xl' : 'aspect-10/11'}`} />
        <div className="p-8 flex-1 space-y-4">
            <div className="h-4 bg-stone-100 rounded-full w-1/4" />
            <div className="h-6 bg-stone-100 rounded-full w-3/4" />
            <div className="h-10 bg-stone-100 rounded-2xl w-full" />
        </div>
    </div>
);

const EmptyState = ({ onReset, t }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
    >
        <div className="w-32 h-32 bg-sage/20 rounded-full flex items-center justify-center mb-8">
            <AlertCircle size={64} className="text-forest/30" />
        </div>
        <h3 className="text-3xl font-black text-charcoal mb-4">{t('no_products_found_shop')}</h3>
        <p className="text-muted font-medium max-w-sm mb-10 leading-relaxed">
            {t('no_products_desc')}
        </p>
        <button 
            onClick={onReset}
            className="px-10 py-5 bg-forest text-white rounded-[20px] font-black flex items-center gap-3 hover:bg-forest-dark transition-all shadow-2xl shadow-forest/20 active:scale-95"
        >
            <RotateCcw size={20} /> {t('reset_filters')}
        </button>
    </motion.div>
);

export default Shop;
