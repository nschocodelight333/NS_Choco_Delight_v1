import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Global unhandled promise rejection listener
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection caught:', event.reason);
});

// Safe Service Worker cleanup in dev mode — never blocks React mounting
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name).catch(() => {});
        }
      }).catch(() => {});
    }
  }
} catch (err) {
  console.warn('SW Cleanup note:', err);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
