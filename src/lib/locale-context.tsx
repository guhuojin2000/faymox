'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translations, detectLocale } from './i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations.en;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// 获取初始语言
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  return detectLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // 使用函数初始化，避免在 effect 中设置
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 如果服务器端默认是 en，但客户端检测到 zh，则更新
    const detected = detectLocale();
    if (detected !== locale) {
      setLocale(detected);
    }
  }, [locale]);

  const t = translations[locale];

  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
