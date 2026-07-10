import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { registerServiceWorker } from '../lib/serviceWorkerRegister';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </div>
        <PWAInstallPrompt />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#0F1620' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0F1620' },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}
