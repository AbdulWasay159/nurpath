import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

/**
 * PWA Install Prompt Component
 * Shows install prompt for web app installation
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      try {
        console.log('[PWA] Install prompt available');
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      } catch (error) {
        console.error('[PWA] Error handling install prompt:', error);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted installation');
      } else {
        console.log('[PWA] User dismissed installation');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't clear deferredPrompt, allow user to install later
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-md mx-auto rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B85F] shadow-2xl overflow-hidden">
          <div className="p-6 text-[#0F172A]">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Download size={24} className="flex-shrink-0" />
                <h3 className="font-semibold text-lg">Install NurPath</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm mb-4 opacity-90">
              Get quick access to your Islamic companion. Install NurPath on your device for a better experience.
            </p>

            {/* Features */}
            <ul className="text-xs space-y-2 mb-6 opacity-85">
              <li>✓ Offline access to adhkar</li>
              <li>✓ Fast app-like experience</li>
              <li>✓ No ads or distractions</li>
            </ul>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] transition"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 bg-white/20 text-[#0F172A] rounded-lg font-semibold hover:bg-white/30 transition"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
