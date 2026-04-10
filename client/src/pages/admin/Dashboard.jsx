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
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, paidOrders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
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

                setStats({
                    products: prods.length,
                    orders: ords.length,
                    revenue: totalRev,
                    paidOrders: paidOrds.length,
                });
                setRecentOrders(ords.slice(0, 5));
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
        </div>
    );
};
export default Dashboard;
