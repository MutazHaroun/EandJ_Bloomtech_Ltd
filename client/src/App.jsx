import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Animated routes component
const AnimatedRoutes = ({ onCartOpen }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<ManageOrders />} />
        </Route>

        {/* Public/User Routes */}
        <Route path="/*" element={
          <div className="min-h-screen flex flex-col relative">
            <Navbar onCartOpen={onCartOpen} />
            
            {/* Spacer for fixed navbar */}
            <div className="h-20" />

            <main className="grow relative z-0">
              <Routes>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
                <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
                <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                <Route path="/track" element={<PageTransition><TrackOrder /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/checkout" element={<PrivateRoute><PageTransition><Checkout /></PageTransition></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><PageTransition><Profile /></PageTransition></PrivateRoute>} />
              </Routes>
            </main>

            <WhatsAppButton />
            <Footer />
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <ToastContainer 
        position="bottom-right" 
        toastClassName="!rounded-2xl !shadow-xl !font-medium"
        progressClassName="!bg-forest"
      />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <AnimatedRoutes onCartOpen={() => setCartOpen(true)} />
    </Router>
  );
}

export default App;
