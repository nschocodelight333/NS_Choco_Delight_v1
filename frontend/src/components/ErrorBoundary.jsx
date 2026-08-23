import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('🚨 Global React Error Boundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-choco-lg border border-choco-100 space-y-4">
            <span className="text-6xl block mb-2">🍫 Oops!</span>
            <h1 className="font-display text-2xl font-bold text-choco-900">
              Something went wrong
            </h1>
            <p className="text-choco-600 text-sm leading-relaxed">
              An unexpected error occurred. Don't worry, your cart and session data are safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-red-50 p-3 rounded-xl border border-red-200 text-xs font-mono text-red-800 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button onClick={this.handleReload} className="btn-gold py-2.5 px-6 text-sm font-bold">
                🔄 Reload Page
              </button>
              <a href="/" className="btn-secondary py-2.5 px-6 text-sm font-bold">
                🏠 Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
