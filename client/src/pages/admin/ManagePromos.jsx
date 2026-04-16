import { useState, useEffect } from 'react';
import API from '../../api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ManagePromos = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ code: '', discount_percentage: '', expiration_date: '' });

    const fetchPromos = async () => {
        try {
            const res = await API.get('/promo');
            setPromos(res.data);
        } catch (err) {
            toast.error('Failed to fetch promos');
        }
        setLoading(false);
    };

    useEffect(() => { fetchPromos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/promo', {
                ...form,
                discount_percentage: parseFloat(form.discount_percentage) / 100
            });
            toast.success('Promo created successfully');
            setForm({ code: '', discount_percentage: '', expiration_date: '' });
            fetchPromos();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create promo');
        }
    };

    const toggleStatus = async (id) => {
        try {
            await API.put(`/promo/${id}/toggle`);
            fetchPromos();
        } catch (err) {
            toast.error('Failed to update promo');
        }
    };

    const deletePromo = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await API.delete(`/promo/${id}`);
            toast.success('Promo deleted');
            fetchPromos();
        } catch (err) {
            toast.error('Failed to delete promo');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted animate-pulse">Loading promos...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-charcoal">Promos & Discounts</h1>
                <p className="text-muted font-medium mt-1">Manage standard promo codes for the shop.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm mb-8">
                <h3 className="font-bold text-charcoal mb-4">Create New Promo</h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                        <label className="text-xs font-bold text-muted uppercase">Promo Code</label>
                        <input type="text" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3" placeholder="e.g. SUMMER20" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-muted uppercase">Discount (%)</label>
                        <input type="number" required min="1" max="100" value={form.discount_percentage} onChange={e => setForm({...form, discount_percentage: e.target.value})} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3" placeholder="e.g. 20" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-muted uppercase">Exp Date (Optional)</label>
                        <input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} className="w-full mt-1 border border-stone-200 rounded-xl px-4 py-3" />
                    </div>
                    <button type="submit" className="w-full md:w-auto px-8 py-3 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold transition-colors h-[46px]">
                        Add
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-cream/50">
                            <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Code</th>
                            <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Discount</th>
                            <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Exp Date</th>
                            <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map(p => (
                            <tr key={p.id} className="border-t border-stone-50 hover:bg-cream/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-charcoal">{p.code}</td>
                                <td className="px-6 py-4 font-bold text-forest">{p.discount_percentage * 100}%</td>
                                <td className="px-6 py-4 text-sm text-muted">{p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : 'Never'}</td>
                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                    {p.is_active ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span> : <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Inactive</span>}
                                </td>
                                <td className="px-6 py-4 flex gap-2 justify-end">
                                    <button onClick={() => toggleStatus(p.id)} className="p-2 bg-stone-100 text-stone-600 rounded-lg">
                                        {p.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                    </button>
                                    <button onClick={() => deletePromo(p.id)} className="p-2 bg-terra/10 text-terra rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default ManagePromos;
