import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Customer pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import CampaignPage from './pages/CampaignPage';
import SpecialOccasionsPage from './pages/SpecialOccasionsPage';
import CustomizeChocolate from './pages/CustomizeChocolate';
import MyCustomOrders from './pages/MyCustomOrders';
import OnlinePayment from './pages/OnlinePayment';

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminCustomers from './pages/Admin/AdminCustomers';
import AdminCampaigns from './pages/Admin/AdminCampaigns';
import AdminCustomRequests from './pages/Admin/AdminCustomRequests';
import AdminReviews from './pages/Admin/AdminReviews';
import AdminLogin from './pages/Admin/AdminLogin';

import MobileBottomNav from './components/MobileBottomNav';
import BackButton from './components/BackButton';
import useAppBackButton from './hooks/useAppBackButton';

// Customer layout wrapper
const CustomerLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <BackButton />
    <main className="flex-1 pb-16 md:pb-0">{children}</main>
    <Footer />
    <MobileBottomNav />
  </div>
);

// Inner routes wrapper to attach useAppBackButton inside BrowserRouter context
const AppContent = () => {
  useAppBackButton();

  return (
    <Routes>
      {/* ─── Customer Routes ───────────────────────────────── */}
      <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
      <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
      <Route path="/products/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
      <Route path="/special-occasions" element={<CustomerLayout><SpecialOccasionsPage /></CustomerLayout>} />
      <Route path="/occasions/:slug" element={<CustomerLayout><SpecialOccasionsPage /></CustomerLayout>} />
      <Route path="/campaigns/:id" element={<CustomerLayout><CampaignPage /></CustomerLayout>} />
      <Route path="/customize" element={<CustomerLayout><CustomizeChocolate /></CustomerLayout>} />
      <Route path="/about" element={<CustomerLayout><About /></CustomerLayout>} />
      <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
      <Route path="/terms" element={<CustomerLayout><Terms /></CustomerLayout>} />
      <Route path="/privacy" element={<CustomerLayout><Privacy /></CustomerLayout>} />
      <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
      <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />

      {/* Protected Customer Routes */}
      <Route path="/cart" element={<CustomerLayout><ProtectedRoute><Cart /></ProtectedRoute></CustomerLayout>} />
      <Route path="/checkout" element={<CustomerLayout><ProtectedRoute><Checkout /></ProtectedRoute></CustomerLayout>} />
      <Route path="/order-confirmation/:id" element={<CustomerLayout><ProtectedRoute><OrderConfirmation /></ProtectedRoute></CustomerLayout>} />
      <Route path="/orders" element={<CustomerLayout><ProtectedRoute><Orders /></ProtectedRoute></CustomerLayout>} />
      <Route path="/orders/:id" element={<CustomerLayout><ProtectedRoute><OrderDetails /></ProtectedRoute></CustomerLayout>} />
      <Route path="/profile" element={<CustomerLayout><ProtectedRoute><Profile /></ProtectedRoute></CustomerLayout>} />
      <Route path="/my-custom-orders" element={<CustomerLayout><ProtectedRoute><MyCustomOrders /></ProtectedRoute></CustomerLayout>} />
      <Route path="/online-payment/:id" element={<CustomerLayout><ProtectedRoute><OnlinePayment /></ProtectedRoute></CustomerLayout>} />

      {/* ─── Admin Routes ───────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="custom-requests" element={<AdminCustomRequests />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#3E2723' }).catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#3E2723',
                color: '#FFF8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#C9A063', secondary: '#3E2723' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#FFF8F0' } },
            }}
          />
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
