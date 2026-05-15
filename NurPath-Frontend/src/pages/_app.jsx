import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Component {...pageProps} />
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F1620',
            color: '#EDE8D8',
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
  );
}
