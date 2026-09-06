import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Limpeza automática de caches antigos e Service Workers no mobile
(function cleanOldCaches() {
  const BUILD_VERSION = '2026-09-06-v2';
  const currentVersion = localStorage.getItem('hmwg_build_version');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  if (currentVersion !== BUILD_VERSION) {
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
    localStorage.setItem('hmwg_build_version', BUILD_VERSION);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
