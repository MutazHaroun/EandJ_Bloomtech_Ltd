import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next'; // 1. استيراد Hook الترجمة
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
    ShoppingBag, User, LogOut, Menu, X, 
    Search, Leaf, ChevronDown, Settings, 
    Globe // أيقونة الكرة الأرضية للغات
} from 'lucide-react';

const Navbar = ({ onCartOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const { t, i18n } = useTranslation(); // 2. تفعيل الترجـمة
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isScrolled, setIsScrolled] = useState(false); 
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const { scrollY } = useScroll();
    const userMenuRef = useRef(null);

    // دالة تبديل اللغة
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'rw' : 'en';
        i18n.changeLanguage(newLang);
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    useEffect(() => {
        setIsMobileOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // 3. تحديث الروابط لتستخدم مفاتيح الترجمة
    const navLinks = [
        { path: '/', label: t('home') },
        { path: '/shop', label: t('shop') },
        { path: '/track', label: t('track_order') },
    ];

    const isActive = (path) => location.pathname === path;

    const UserMenuDropdown = () => (
        <AnimatePresence>
            {isUserMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-100 p-4 z-70"
                >
                    <div className="flex items-center gap-4 px-2 pb-4 mb-4 border-b border-stone-50">
                        <div className="w-12 h-12 bg-forest rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-charcoal">{user?.name}</span>
                            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{user?.role} Account</span>
                        </div>
                    </div>
                    
                    <div className="grid gap-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate hover:bg-sage/20 hover:text-forest transition-all">
                            <Settings size={18} /> {t('account_settings')}
                        </Link>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 mt-4 py-4 rounded-2xl bg-red-50 text-terra font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                    >
                        <LogOut size={16} /> {t('logout')}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <div className="h-20 md:h-24 w-full" />

            <header 
                className={`fixed left-0 right-0 z-45 transition-all duration-500 px-4 md:px-8 mx-auto max-w-7xl`}
                style={{ top: isScrolled ? '0.75rem' : '1.5rem' }}
            >
                <div 
                    className={`rounded-4xl transition-all duration-500 border ${
                        isScrolled 
                        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-white/50 py-3 px-8' 
                        : 'bg-white/80 backdrop-blur-md border-transparent py-5 px-6 shadow-sm'
                    }`}
                >
                    <div className="flex justify-between items-center">
                        
                        <Link to="/" className="flex items-center gap-3 group relative z-10">
                            <motion.div 
                                whileHover={{ rotate: 15 }}
                                className="w-10 h-10 md:w-12 md:h-12 bg-forest rounded-2xl flex items-center justify-center shadow-lg"
                            >
                                <Leaf className="text-white" size={24} />
                            </motion.div>
                            <div className="flex items-baseline">
                                <span className="text-xl font-extrabold text-charcoal tracking-tight">E&J</span>
                                <span className="text-xl font-light text-muted ml-1 uppercase tracking-tighter hidden md:inline">Bloomtech</span>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.path} 
                                    to={link.path}
                                    className={`relative px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                                        isActive(link.path) ? 'text-forest' : 'text-slate/60 hover:text-charcoal'
                                    }`}
                                >
                                    <span className="relative z-10">{link.label}</span>
                                    {isActive(link.path) && (
                                        <motion.div 
                                            layoutId="active-nav-glow"
                                            className="absolute inset-0 bg-forest/5 rounded-full z-0"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 md:gap-5 relative z-10">
                            {/* 4. زر تبديل اللغة الجديد */}
                            <button 
                                onClick={toggleLanguage} 
                                className="flex items-center gap-2 px-3 py-2 rounded-2xl text-slate hover:bg-forest/5 transition-all border border-stone-100 bg-white/50"
                            >
                                <Globe size={16} className="text-forest" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                    {i18n.language === 'en' ? 'RW' : 'EN'}
                                </span>
                            </button>

                            <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-2xl text-slate hover:bg-forest/5 transition-all">
                                <Search size={20} />
                            </button>

                            <button onClick={onCartOpen} className="relative p-2.5 rounded-2xl text-slate hover:bg-forest/5 transition-all">
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-terra text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-8 w-px bg-stone-200/50 mx-1 hidden md:block" />

                            {user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 bg-stone-50 p-1 pr-3 rounded-2xl border border-stone-100">
                                        <div className="w-8 h-8 bg-forest rounded-xl flex items-center justify-center text-white text-xs font-bold">
                                            {user.name[0]}
                                        </div>
                                        <ChevronDown size={14} className={`text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <UserMenuDropdown />
                                </div>
                            ) : (
                                <Link to="/login" className="hidden md:block text-xs font-black uppercase bg-forest text-white px-6 py-2.5 rounded-2xl hover:bg-forest-dark transition-all">
                                    {t('join_us')}
                                </Link>
                            )}

                            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-2 text-slate">
                                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* SEARCH OVERLAY */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 bg-white/95 backdrop-blur-2xl flex items-center justify-center p-8"
                    >
                        <button onClick={() => setIsSearchOpen(false)} className="absolute top-12 right-12 p-5 bg-stone-100 rounded-full"><X size={28} /></button>
                        <div className="max-w-3xl w-full">
                            <h2 className="text-5xl md:text-7xl font-black text-charcoal mb-12 tracking-tighter text-center">{t('search_title')}</h2>
                            <div className="relative">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-forest" size={32} />
                                <input autoFocus type="text" placeholder={t('search_placeholder')} className="w-full bg-stone-50 border-b-8 border-stone-100 p-10 pl-24 text-3xl font-bold focus:outline-none focus:border-forest rounded-t-[40px]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed inset-0 z-90 bg-white lg:hidden flex flex-col p-10 pt-32"
                    >
                        <nav className="space-y-8 flex-1">
                            {navLinks.map((link) => (
                                <Link key={link.path} to={link.path} className={`text-5xl font-black block ${isActive(link.path) ? 'text-forest' : 'text-charcoal'}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="pt-10 border-t border-stone-100">
                            <button onClick={toggleLanguage} className="w-full mb-4 py-4 flex items-center justify-center gap-3 bg-stone-50 rounded-2xl font-bold">
                                <Globe size={20} /> {i18n.language === 'en' ? 'Switch to Kinyarwanda' : 'Gura mu Cyongereza'}
                            </button>
                            {!user ? (
                                <Link to="/login" className="w-full py-5 block text-center font-black uppercase bg-forest text-white rounded-3xl">{t('join_us')}</Link>
                            ) : (
                                <button onClick={handleLogout} className="w-full py-5 bg-red-50 text-terra font-black rounded-3xl">{t('logout')}</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
