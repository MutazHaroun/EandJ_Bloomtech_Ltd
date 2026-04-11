import { useState, useEffect } from 'react';
import API from '../../api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Leaf, Search, Upload } from 'lucide-react';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    
    // State للنموذج والملف
    const [form, setForm] = useState({ name: '', description: '', category: 'flowers', price: '', stock_quantity: '' });
    const [imageFile, setImageFile] = useState(null);

    const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001"; // تأكد من مطابقة بورت السيرفر لديك

    const fetchProducts = async () => {
        try {
            const res = await API.get('/products?limit=100');
            setProducts(res.data.products);
        } catch (err) {
            toast.error('Failed to fetch products');
        }
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    
    // دالة معالجة اختيار الملف
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', description: '', category: 'flowers', price: '', stock_quantity: '' });
        setImageFile(null);
        setFormVisible(true);
    };

    const openEdit = (prod) => {
        setEditingId(prod.id);
        setForm({ name: prod.name, description: prod.description || '', category: prod.category, price: prod.price, stock_quantity: prod.stock_quantity });
        setImageFile(null); // اتركها فارغة إذا لم يرد المستخدم تغيير الصورة القديمة
        setFormVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // استخدام FormData لدعم رفع الملفات
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('category', form.category);
        formData.append('price', form.price);
        formData.append('stock_quantity', form.stock_quantity);
        if (imageFile) {
            formData.append('image', imageFile); // 'image' هو الاسم الذي سيتوقعه Multer في السيرفر
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            if (editingId) {
                await API.put(`/products/${editingId}`, formData, config);
                toast.success('Product updated');
            } else {
                await API.post('/products', formData, config);
                toast.success('Product created');
            }
            setFormVisible(false);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Action failed');
        }
    };

    // ... (بقية الدوال مثل handleDelete و getCategoryColor تبقى كما هي)

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            await API.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'flowers': return 'bg-pink-50 text-pink-700';
            case 'trees': return 'bg-emerald-50 text-emerald-700';
            case 'tools': return 'bg-amber-50 text-amber-700';
            default: return 'bg-stone-100 text-stone-600';
        }
    };

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-charcoal">Products</h1>
                    <p className="text-muted font-medium mt-1">{products.length} products in catalog</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-forest hover:bg-forest-dark text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition shadow-sm text-sm"
                />
            </div>

            {/* ═══ FORM MODAL ═══ */}
            <AnimatePresence>
                {formVisible && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setFormVisible(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl p-8 z-50 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-extrabold text-charcoal">
                                    {editingId ? 'Edit Product' : 'New Product'}
                                </h3>
                                <button onClick={() => setFormVisible(false)} className="p-2 rounded-full hover:bg-stone-100 text-muted transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">Product Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                                        className="w-full px-4 py-3 bg-cream border-2 border-stone-200 rounded-xl text-charcoal focus:outline-none focus:border-forest transition" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">Category</label>
                                        <select name="category" value={form.category} onChange={handleChange}
                                            className="w-full px-4 py-3 bg-cream border-2 border-stone-200 rounded-xl text-charcoal focus:outline-none focus:border-forest transition">
                                            <option value="flowers">Flowers</option>
                                            <option value="trees">Trees</option>
                                            <option value="tools">Tools</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">Price (RWF)</label>
                                        <input type="number" name="price" value={form.price} onChange={handleChange} required
                                            className="w-full px-4 py-3 bg-cream border-2 border-stone-200 rounded-xl text-charcoal focus:outline-none focus:border-forest transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">Stock Quantity</label>
                                    <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} required
                                        className="w-full px-4 py-3 bg-cream border-2 border-stone-200 rounded-xl text-charcoal focus:outline-none focus:border-forest transition" />
                                </div>

                                {/* حقل رفع الصورة الجديد */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">Product Image</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                            className="hidden" 
                                            id="file-upload"
                                        />
                                        <label 
                                            htmlFor="file-upload"
                                            className="flex items-center justify-center w-full px-4 py-6 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:bg-stone-100 hover:border-forest transition group"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Upload size={24} className="text-stone-400 group-hover:text-forest mb-2" />
                                                <span className="text-sm font-medium text-stone-600">
                                                    {imageFile ? imageFile.name : 'Click to upload image'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setFormVisible(false)}
                                        className="flex-1 py-3 border-2 border-stone-200 text-slate rounded-xl font-bold hover:bg-stone-50 transition">
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="flex-1 py-3 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold shadow-md transition active:scale-[0.98]">
                                        {editingId ? 'Update' : 'Create'} Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══ TABLE ═══ */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-cream/50">
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Product</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Category</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Price</th>
                                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Stock</th>
                                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="border-t border-stone-50 hover:bg-cream/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-stone-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                                {p.image_url ? (
                                                    // تعديل رابط الصورة ليقرأ من السيرفر إذا كان المسار يبدأ بـ /uploads
                                                    <img src={p.image_url.startsWith('http') ? p.image_url : `${API_URL}${p.image_url}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Leaf size={16} className="text-stone-300" />
                                                )}
                                            </div>
                                            <span className="font-semibold text-charcoal text-sm">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getCategoryColor(p.category)}`}>
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-forest">{parseInt(p.price).toLocaleString()} RWF</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-semibold ${p.stock_quantity > 5 ? 'text-charcoal' : p.stock_quantity > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                            {p.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-1">
                                            <button onClick={() => openEdit(p)} className="p-2 text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
export default ManageProducts;
