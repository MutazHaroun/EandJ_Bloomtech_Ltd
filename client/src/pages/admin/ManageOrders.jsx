import { useState, useEffect } from 'react';
import API from '../../api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/orders');
            setOrders(res.data);
        } catch (err) {
            toast.error('Failed to fetch orders');
        }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/status`, { status: newStatus });
            toast.success('Order status updated');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'paid': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-stone-100 text-stone-600 border-stone-200';
        }
    };

    const filtered = orders.filter(o =>
        (o.tracking_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Tracking,Customer,Email,Phone,Amount,Status,Date\n";
        filtered.forEach(o => {
            const row = [
                o.tracking_number || '',
                o.user_name || 'Guest',
                o.user_email || o.guest_email || '',
                o.guest_phone || '',
                o.total_amount,
                o.status,
                new Date(o.created_at).toLocaleDateString()
            ].map(String).join(",");
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Stats
    const pending = orders.filter(o => o.status === 'pending').length;
    const paid = orders.filter(o => o.status === 'paid').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-stone-100 rounded-full w-48 animate-pulse" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100" />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-charcoal">Orders</h1>
                    <p className="text-muted font-medium mt-1">{orders.length} total orders</p>
                </div>
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-charcoal font-bold rounded-2xl transition-all shadow-sm"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Pending', count: pending, style: 'bg-amber-50 text-amber-700 border-amber-100' },
                    { label: 'Paid', count: paid, style: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { label: 'Shipped', count: shipped, style: 'bg-purple-50 text-purple-700 border-purple-100' },
                    { label: 'Delivered', count: delivered, style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`rounded-2xl p-4 border ${item.style} text-center`}
                    >
                        <p className="text-2xl font-extrabold">{item.count}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mt-0.5">{item.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search by tracking number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-96 pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition shadow-sm text-sm"
                />
            </div>

            {/* ═══ TABLE ═══ */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-cream/50">
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Tracking</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Customer</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Amount</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Date</th>
                                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => (
                                <tr key={o.id} className="border-t border-stone-50 hover:bg-cream/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono font-medium text-muted">
                                            {o.tracking_number || o.id.split('-')[0]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-charcoal">{o.user_name}</p>
                                        <p className="text-xs text-muted">{o.user_email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-charcoal">{parseInt(o.total_amount).toLocaleString()} RWF</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getStatusStyle(o.status)}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted">
                                        {new Date(o.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={o.status}
                                            onChange={(e) => updateStatus(o.id, e.target.value)}
                                            className="bg-cream border border-stone-200 text-charcoal text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default ManageOrders;
