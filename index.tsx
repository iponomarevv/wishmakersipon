import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Wait for Telegram WebApp script to load and initialize
const waitForTelegram = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.Telegram?.WebApp) {
      // Ensure ready() and expand() are called immediately
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (error) {
        console.warn('Error initializing Telegram WebApp in waitForTelegram:', error);
      }
      resolve();
      return;
    }
    
    // Wait up to 3 seconds for Telegram WebApp to load
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.Telegram?.WebApp) {
        // Initialize immediately when found
        try {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        } catch (error) {
          console.warn('Error initializing Telegram WebApp in interval:', error);
        }
        clearInterval(checkInterval);
        resolve();
      } else if (attempts > 30) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error boundary for production - filter out errors from external sources
window.addEventListener('error', (event) => {
  const errorMessage = event.error?.message || event.message || '';
  const errorSource = event.filename || '';
  
  // Ignore errors from external sources (Telegram, extensions, etc.)
  const isExternalError = 
    errorSource.includes('peerProfile') ||
    errorSource.includes('solid.js') ||
    errorSource.includes('telegram.org') ||
    errorMessage.includes('solid.js') ||
    errorMessage.includes('peerProfile');
  
  if (isExternalError) {
    console.warn('Ignoring external error:', errorMessage, errorSource);
    return;
  }
  
  console.error('Global error:', event.error);
  // Only show error message for our app errors
  if (rootElement && !isExternalError) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 20px; padding: 20px; text-align: center; color: #ffffff; background: #101318;">
        <div style="font-size: 18px; font-weight: bold;">Ошибка загрузки приложения</div>
        <div style="color: #aaaaaa; font-size: 14px;">Пожалуйста, обновите страницу</div>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #8774e1; color: #ffffff; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
          Обновить
        </button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  
  // Ignore errors from external sources
  const isExternalError = 
    reason.includes('peerProfile') ||
    reason.includes('solid.js') ||
    reason.includes('telegram.org');
  
  if (isExternalError) {
    console.warn('Ignoring external promise rejection:', reason);
    event.preventDefault(); // Prevent error from showing
    return;
  }
  
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize app after Telegram WebApp is ready (or timeout)
waitForTelegram().then(() => {
  const root = ReactDOM.createRoot(rootElement!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Error initializing app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 20px; padding: 20px; text-align: center; color: #ffffff; background: #101318;">
      <div style="font-size: 18px; font-weight: bold;">Ошибка инициализации</div>
      <div style="color: #aaaaaa; font-size: 14px;">Пожалуйста, обновите страницу</div>
      <button onclick="window.location.reload()" style="padding: 12px 24px; background: #8774e1; color: #ffffff; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
        Обновить
      </button>
    </div>
  `;
});