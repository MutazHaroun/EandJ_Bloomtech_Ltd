import { useState, useEffect } from 'react';
import API from '../../api';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowUpRight } from 'lucide-react';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
};
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Dashboard = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, paidOrders: 0, weeklyData: [] });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    API.get('/products?limit=1000'),
                    API.get('/orders')
                ]);

                const prods = productsRes.data.products;
                const ords = ordersRes.data;
                const paidOrds = ords.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
                const totalRev = paidOrds.reduce((sum, curr) => sum + parseFloat(curr.total_amount), 0);

                const now = new Date();
                const last4Weeks = [0, 0, 0, 0];
                
                paidOrds.forEach(order => {
                    const orderDate = new Date(order.created_at);
                    const diffTime = Math.abs(now - orderDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 7) last4Weeks[3] += parseFloat(order.total_amount);
                    else if (diffDays <= 14) last4Weeks[2] += parseFloat(order.total_amount);
                    else if (diffDays <= 21) last4Weeks[1] += parseFloat(order.total_amount);
                    else if (diffDays <= 28) last4Weeks[0] += parseFloat(order.total_amount);
                });

                const maxWeekly = Math.max(...last4Weeks, 1);
                const weeklyData = last4Weeks.map((val, i) => ({
                    value: val,
                    height: (val / maxWeekly) * 100,
                    label: i === 3 ? "This Wk" : `${3 - i} Wks Ago`
                }));

                setStats({
                    products: prods.length,
                    orders: ords.length,
                    revenue: totalRev,
                    paidOrders: paidOrds.length,
                    weeklyData,
                });
                setRecentOrders(ords.slice(0, 5));
                setLowStock(prods.filter(p => p.stock_quantity <= 5).sort((a,b) => a.stock_quantity - b.stock_quantity).slice(0, 5));
            } catch (err) {
                console.error('Failed to load dashboard');
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700';
            case 'paid': return 'bg-blue-50 text-blue-700';
            case 'shipped': return 'bg-purple-50 text-purple-700';
            case 'delivered': return 'bg-emerald-50 text-emerald-700';
            case 'cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-stone-100 text-stone-600';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-stone-100 rounded-full w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse border border-stone-100" />
                    ))}
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Revenue',
            value: `${stats.revenue.toLocaleString()} RWF`,
            change: '+12.5%',
            icon: <DollarSign size={22} />,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
        },
        {
            title: 'Total Orders',
            value: stats.orders,
            change: `${stats.paidOrders} paid`,
            icon: <ShoppingCart size={22} />,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Products',
            value: stats.products,
            change: 'In catalog',
            icon: <Package size={22} />,
            color: 'bg-purple-500',
            lightColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            title: 'Conversion',
            value: stats.orders > 0 ? `${Math.round((stats.paidOrders / stats.orders) * 100)}%` : '0%',
            change: 'Order success',
            icon: <TrendingUp size={22} />,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-charcoal">Dashboard</h1>
                <p className="text-muted font-medium mt-1">Welcome back. Here's an overview of your store.</p>
            </div>

            {/* ═══ METRIC CARDS ═══ */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
            >
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        variants={item}
                        className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 ${card.lightColor} rounded-xl flex items-center justify-center ${card.textColor}`}>
                                {card.icon}
                            </div>
                            <span className={`text-[11px] font-bold ${card.textColor} ${card.lightColor} px-2.5 py-1 rounded-full flex items-center`}>
                                <ArrowUpRight size={11} className="mr-0.5" />
                                {card.change}
                            </span>
                        </div>
                        <p className="text-2xl font-extrabold text-charcoal">{card.value}</p>
                        <p className="text-xs text-muted font-medium mt-1">{card.title}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ═══ WEEKLY SALES REPORT CHART ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm mb-10 overflow-hidden relative"
            >
                <div className="mb-6">
                    <h3 className="font-extrabold text-charcoal text-lg">Sales Report (Past 4 Weeks)</h3>
                    <p className="text-xs text-muted mt-1">Growth tracking based on successful purchases</p>
                </div>

                <div className="flex items-end justify-between sm:justify-around h-48 mt-4 gap-4 sm:gap-12 relative z-10">
                    {stats.weeklyData.map((week, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 max-w-[80px]">
                            <div className="w-full flex justify-center h-40 items-end relative group">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${week.height}%` }}
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.2, delay: idx * 0.1 }}
                                    className={`w-full max-w-[50px] rounded-t-lg transition-colors relative cursor-pointer
                                        ${idx === 3 ? 'bg-forest group-hover:bg-forest-light' : 'bg-sage/40 group-hover:bg-sage/70'}
                                    `}
                                />
                                {/* Tooltip */}
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-charcoal text-white text-xs font-bold py-1 px-3 rounded-lg shadow-lg whitespace-nowrap z-20 origin-bottom">
                                    {week.value.toLocaleString()} RWF
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-charcoal" />
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-3 text-center">
                                {week.label}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ═══ RECENT ORDERS TABLE ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-charcoal">Recent Orders</h3>
                        <p className="text-xs text-muted mt-0.5">Latest 5 orders across the platform</p>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-10 text-center text-muted font-medium">No orders yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-cream/50">
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Tracking</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Customer</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Amount</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, idx) => (
                                    <tr key={order.id} className="border-t border-stone-50 hover:bg-cream/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-medium text-muted">
                                                {order.tracking_number || order.id.split('-')[0]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-charcoal">{order.user_name}</p>
                                            <p className="text-xs text-muted">{order.user_email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-charcoal">{parseInt(order.total_amount).toLocaleString()} RWF</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* ═══ LOW STOCK ALERTS ═══ */}
            {lowStock.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-terra/5 rounded-2xl border border-terra/20 shadow-sm overflow-hidden mt-10"
                >
                    <div className="px-6 py-5 border-b border-terra/10 flex justify-between items-center bg-terra/10">
                        <div>
                            <h3 className="font-bold text-tera flex items-center gap-2"><Package size={18} className="text-terra" /> Low Stock Alerts</h3>
                            <p className="text-xs text-terra/70 font-semibold mt-0.5">Products that need restock immediately</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-terra/70">Product Name</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-terra/70">Category</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-terra/70">Remaining</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map((prod) => (
                                    <tr key={prod.id} className="border-t border-terra/10 bg-white/50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-charcoal">{prod.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase text-terra bg-terra/10 px-2 py-1 rounded-md">{prod.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-extrabold text-terra">{prod.stock_quantity} in stock</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
export default Dashboard;
