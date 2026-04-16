import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Leaf, ArrowLeft, ChevronRight, Gift } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/products', name: 'Products', icon: <Package size={20} /> },
        { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart size={20} /> },
        { path: '/admin/promos', name: 'Promos', icon: <Gift size={20} /> },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-cream">
            {/* ═══ SIDEBAR ═══ */}
            <aside className="w-72 bg-forest-dark flex flex-col fixed top-0 left-0 h-screen z-30">
                {/* Logo */}
                <div className="p-6 pb-8">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Leaf className="text-forest-light" size={22} />
                        </div>
                        <div>
                            <span className="text-base font-extrabold text-white">E&J</span>
                            <span className="text-base font-light text-white/50 ml-1">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="grow px-4 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-4 mb-3">Management</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive(item.path)
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                            }`}
                        >
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="admin-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-forest-light rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span>{item.icon}</span>
                            <span className="font-semibold text-sm">{item.name}</span>
                            {isActive(item.path) && <ChevronRight size={14} className="ml-auto text-white/40" />}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    {/* User Info */}
                    {user && (
                        <div className="px-4 py-3 bg-white/5 rounded-xl mb-2">
                            <p className="text-white text-sm font-semibold">{user.name}</p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                        </div>
                    )}

                    <Link
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition text-sm font-semibold"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Store</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 ml-72 min-h-screen">
                <div className="p-8 lg:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
export default AdminLayout;
