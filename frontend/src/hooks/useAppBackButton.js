import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import toast from 'react-hot-toast';

export const useAppBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastBackTimeRef = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      const pathname = location.pathname;
      const isRootPage = pathname === '/' || pathname === '/admin';

      if (isRootPage) {
        const now = Date.now();
        if (now - lastBackTimeRef.current < 2000) {
          CapApp.exitApp();
        } else {
          lastBackTimeRef.current = now;
          toast('Press back again to exit app', {
            id: 'app-exit-toast',
            icon: '🚪',
            duration: 2000,
          });
        }
      } else {
        // If history stack index exists > 0, go back 1 step; else fallback to Home
        if (window.history.state && window.history.state.idx > 0) {
          navigate(-1);
        } else {
          navigate('/', { replace: true });
        }
      }
    });

    return () => {
      backListener.then((h) => h.remove?.()).catch(() => {});
    };
  }, [location.pathname, navigate]);
};

export default useAppBackButton;
