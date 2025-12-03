import { useEffect, useMemo, useState } from 'react';
import { TelegramWebApp, WebAppMainButton, WebAppBackButton, WebAppThemeParams, WebAppCloudStorage } from './types';

const getTelegramApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
};

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(() => getTelegramApp());
  const [themeParams, setThemeParams] = useState<WebAppThemeParams | null>(() => webApp?.themeParams ?? null);

  useEffect(() => {
    setWebApp(getTelegramApp());
  }, []);

  useEffect(() => {
    if (!webApp) return;
    
    try {
      webApp.ready();
      webApp.expand();
    } catch (error) {
      console.warn('Error initializing Telegram WebApp:', error);
    }

    const handleThemeChange = () => {
      try {
        setThemeParams({ ...(webApp.themeParams || {}) });
      } catch (error) {
        console.warn('Error handling theme change:', error);
      }
    };

    try {
      webApp.onEvent?.('themeChanged', handleThemeChange);
    } catch (error) {
      console.warn('Error setting up theme change listener:', error);
    }

    return () => {
      try {
        webApp.offEvent?.('themeChanged', handleThemeChange);
      } catch (error) {
        console.warn('Error removing theme change listener:', error);
      }
    };
  }, [webApp]);

  const mainButton: WebAppMainButton | null = useMemo(() => webApp?.MainButton ?? null, [webApp]);
  const backButton: WebAppBackButton | null = useMemo(() => webApp?.BackButton ?? null, [webApp]);
  const cloudStorage: WebAppCloudStorage | null = useMemo(() => webApp?.cloudStorage ?? null, [webApp]);

  return {
    webApp,
    isTelegram: Boolean(webApp),
    themeParams,
    colorScheme: webApp?.colorScheme ?? 'dark',
    mainButton,
    backButton,
    cloudStorage,
  };
};

export type UseTelegramReturn = ReturnType<typeof useTelegram>;

