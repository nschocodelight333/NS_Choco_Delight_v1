import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl border border-choco-100 space-y-4">
            <span className="text-6xl block">🍫</span>
            <h2 className="font-display font-bold text-choco-900 text-2xl">Something went wrong</h2>
            <p className="text-choco-600 text-sm leading-relaxed">
              An unexpected display issue occurred. Don't worry, clicking below will safely reset your session and reload the page.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="btn-gold w-full py-3 text-sm font-bold shadow-xs"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={this.handleReload}
                className="btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                🧹 Clear Session & Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
