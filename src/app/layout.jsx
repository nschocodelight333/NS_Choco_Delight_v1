import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'NS Choco Delight | Handmade Artisanal Chocolates',
  description: 'Premium homemade chocolates crafted with love. Kunafa chocolate, custom shape chocolates, gift hampers & bites delivered to your doorstep.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="flex flex-col min-h-screen antialiased bg-cream text-choco-900">
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Navbar />
            <main className="flex-grow pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
