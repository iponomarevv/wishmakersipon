import React, { useEffect, useRef } from 'react';

interface TelegramLoginProps {
  botName: string;
  onAuth: (user: {
    id: string;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
  }) => void;
  lang?: 'ru' | 'en';
}

const TelegramLogin: React.FC<TelegramLoginProps> = ({ botName, onAuth, lang = 'ru' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Telegram Login Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Set up global callback
    (window as any).onTelegramAuth = (user: any) => {
      onAuth({
        id: user.id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        language_code: user.language_code,
      });
    };

    containerRef.current.appendChild(script);

    return () => {
      // Cleanup
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
      delete (window as any).onTelegramAuth;
    };
  }, [botName, onAuth]);

  const texts = {
    ru: {
      title: 'Войдите через Telegram',
      subtitle: 'Чтобы использовать приложение, войдите через Telegram',
    },
    en: {
      title: 'Login with Telegram',
      subtitle: 'To use the app, please login with Telegram',
    },
  };

  const t = texts[lang];

  return (
    <div className="min-h-screen bg-[#101318] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#151517] rounded-[24px] p-8 border border-white/10 text-center">
        <div className="mb-6">
          <div className="text-[24px] font-bold text-white mb-2">{t.title}</div>
          <div className="text-white/60 text-[14px]">{t.subtitle}</div>
        </div>
        <div ref={containerRef} className="flex justify-center"></div>
      </div>
    </div>
  );
};

export default TelegramLogin;





