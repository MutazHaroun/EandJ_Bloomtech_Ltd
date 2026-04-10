import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppButton = () => {
    return (
        <motion.a 
            href="https://wa.me/+250788306534" 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl z-40 flex items-center justify-center"
        >
            <MessageCircle size={26} />
        </motion.a>
    );
};
export default WhatsAppButton;
