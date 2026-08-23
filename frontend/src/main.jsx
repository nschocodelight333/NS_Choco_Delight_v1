import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Global unhandled promise rejection listener
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection caught:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register Service Worker for PWA browser address bar installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('✅ PWA ServiceWorker active on localhost:', reg.scope);
    }).catch((err) => {
      console.log('PWA ServiceWorker registration failed: ', err);
    });
  });
}
