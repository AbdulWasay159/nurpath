import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * React Error Boundary
 *
 * Catches rendering errors anywhere in its child component tree and shows a
 * friendly fallback UI instead of crashing the whole app to a blank screen.
 *
 * Error boundaries must be class components — React does not yet support
 * an equivalent hook (componentDidCatch / getDerivedStateFromError have no
 * hook form). This is the one place in the codebase a class component is
 * required and intentional.
 *
 * Note: error boundaries do NOT catch errors inside:
 *  - event handlers (use try/catch there, as already done in api calls)
 *  - async code (promises, setTimeout, etc.)
 *  - server-side rendering
 *  - errors thrown in the boundary itself
 * They only catch errors thrown during rendering, in lifecycle methods, and
 * in constructors of the component tree below them.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log for debugging — in production this is where you'd report to a
    // monitoring service. We deliberately avoid crashing again here.
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Allow callers to supply their own fallback UI if needed
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              textAlign: 'center',
              padding: '2rem',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} color="#C9A84C" />
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              This part of NurPath ran into an unexpected error. You can try
              again, or head back to the home page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre
                style={{
                  textAlign: 'left',
                  fontSize: '0.7rem',
                  color: '#EF4444',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(201,168,76,0.2)',
                  border: '2px solid #C9A84C',
                  color: '#C9A84C',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
