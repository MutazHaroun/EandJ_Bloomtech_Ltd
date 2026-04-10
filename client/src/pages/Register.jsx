import { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // إضافة الاستيراد
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Leaf, ArrowRight } from 'lucide-react';

const Register = () => {
    const { t } = useTranslation(); // تفعيل الترجمة
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        phone: '', 
        address: '' 
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/register', form);
            toast.success(t('register_success_toast')); // نص مترجم
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || t('register_error_toast')); // نص مترجم
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl border border-stone-100">

                {/* Left — Branding Panel */}
                <div className="hidden lg:flex bg-gradient-to-br from-forest-dark to-forest flex-col justify-center p-14 relative overflow-hidden">
                    <div className="absolute top-10 right-10 w-40 h-40 bg-forest-light/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-60 h-60 bg-sage/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-10">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Leaf className="text-forest-light" size={22} />
                            </div>
                            <span className="text-xl font-extrabold text-white">E&J Bloomtech</span>
                        </div>

                        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                            {t('register_title')}
                        </h2>
                        <p className="text-white/50 leading-relaxed">
                            {t('register_subtitle')}
                        </p>
                    </div>
                </div>

                {/* Right — Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-10 sm:p-14 flex flex-col justify-center"
                >
                    <h2 className="text-3xl font-extrabold text-charcoal mb-2">{t('register_header')}</h2>
                    <p className="text-muted mb-8">{t('register_desc')}</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('full_name_label')}</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="your name"
                                    className="w-full pl-12 pr-4 py-3.5 bg-cream border-2 border-stone-200 rounded-2xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('email_label')}</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-cream border-2 border-stone-200 rounded-2xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('password_label')}</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-cream border-2 border-stone-200 rounded-2xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('phone_label')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+250..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-cream border-2 border-stone-200 rounded-2xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">{t('address_label')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Kigali, Rwanda"
                                        className="w-full pl-12 pr-4 py-3.5 bg-cream border-2 border-stone-200 rounded-2xl text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-forest hover:bg-forest-dark text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{t('register_btn')}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted mt-8">
                        {t('already_have_account')}{' '}
                        <Link to="/login" className="text-forest font-bold hover:text-forest-dark transition">{t('login_link')}</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
