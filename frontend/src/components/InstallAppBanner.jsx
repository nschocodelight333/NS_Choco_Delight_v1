import { useState, useEffect } from 'react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also check if appinstalled event fires
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gold-500 text-choco-900 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold border-b border-gold-600/40">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg flex-shrink-0">📱</span>
        <p className="truncate">
          Install <span className="font-bold">NS Choco Delight</span> App on your phone for faster ordering!
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <button
          onClick={handleInstallClick}
          id="pwa-install-banner-btn"
          className="bg-choco-900 text-cream px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-choco-800 transition-all cursor-pointer min-h-[36px] flex items-center"
        >
          Install App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-choco-900/70 hover:text-choco-900 p-1 text-sm leading-none"
          aria-label="Dismiss app banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
