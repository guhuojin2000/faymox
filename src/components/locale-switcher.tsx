'use client';

import { useLocale } from '@/lib/locale-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="text-white/60 hover:text-white hover:bg-white/10"
    >
      <Globe className="w-4 h-4 mr-1" />
      {locale === 'zh' ? 'EN' : '中'}
    </Button>
  );
}
