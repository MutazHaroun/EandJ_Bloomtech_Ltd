import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * E&J Bloomtech Ltd - Professional Footer with Google Maps Integration
 */

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // رابط مضمن يشير بالضبط إلى إحداثيات المشاتل
  const mapEmbedUrl = "https://maps.google.com/maps?q=-1.9688403,30.1144477&t=&z=15&ie=UTF8&iwloc=&output=embed";

  const Icons = {
    Leaf: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1.8 9.2a7 7 0 0 1-9.8 8.8Z" />
        <path d="M11 20v-5.5a2.5 2.5 0 1 0-5 0V20" />
        <path d="M11 14.5a2.5 2.5 0 0 1 5 0V20" />
      </svg>
    ),
    Phone: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    Mail: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    MapPin: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  };

  const linkGroups = {
    shop: [
      { label: t('flowers'), path: '/shop?category=flowers' },
      { label: t('cat_trees_title'), path: '/shop?category=indoor' },
      { label: t('trees'), path: '/shop?category=trees' },
      { label: t('tools'), path: '/shop?category=tools' }
    ],
    support: [
      { label: t('track_your_order_btn'), path: '/track' }
    ]
  };

  return (
    <footer className="bg-emerald-950 text-white pt-16 pb-8 border-t border-white/10 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-900/20">
                <Icons.Leaf />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter italic text-white">E&J</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.5em] -mt-1">Bloomtech</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              {t('hero_description')}
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-colors">
                <Icons.Phone /> <span className="text-sm font-semibold tracking-tight">+250 788 306 534</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-colors">
                <Icons.Mail /> <span className="text-sm font-semibold lowercase">info@bloomtech.rw</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6">{t('categories')}</h4>
            <ul className="space-y-4">
              {linkGroups.shop.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-white/50 hover:text-white text-sm font-medium transition-all hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* خريطة موقع المشتل - Google Maps */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6">
               {t('find_us_title', 'Visit Our Nursery')}
            </h4>
            <a 
              href="https://maps.app.goo.gl/MLjB6qLHYGgTZ9hY9?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-52 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group bg-emerald-900/20 cursor-pointer"
            >
              {/* Disable pointer events on iframe so the anchor receives the click */}
              <iframe
                title="E&J Bloomtech Nursery Location"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute inset-0 z-10 bg-emerald-950/20 group-hover:bg-transparent transition-colors duration-300 block w-full h-full" />
              
              <div className="absolute z-20 top-4 right-4 bg-emerald-600 group-hover:bg-emerald-500 px-4 py-2 rounded-full shadow-lg transition-transform transform group-hover:scale-105 flex items-center gap-2">
                 <Icons.MapPin />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest mt-0.5">Open in Maps</span>
              </div>
            </a>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
          <div>
            <p>© {currentYear} E&J Bloomtech Ltd.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right leading-none">
              <p className="text-[10px] font-black text-emerald-500/80 tracking-[0.2em]">{t('kigali_rwanda')}</p>
            </div>
            
            <div className="w-10 h-6 rounded-sm overflow-hidden flex flex-col border border-white/10 shadow-lg grayscale-[0.3] hover:grayscale-0 transition-all">
              <div className="h-[40%] bg-[#00A1DE]" />
              <div className="h-[30%] bg-[#FAD201]" />
              <div className="h-[30%] bg-[#20603D]" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-linear-to-r from-emerald-950 via-emerald-500 to-emerald-950 opacity-30 mt-8 w-full" />
    </footer>
  );
};

export default Footer;

