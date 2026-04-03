'use client';

import { useLocale } from '@/lib/locale-context';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  amount: number;
  velocity: number;
}

export default function ShareButton({ amount, velocity }: ShareButtonProps) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const shareText = typeof t.shareText === 'function' 
    ? t.shareText(amount, velocity) 
    : '';

  const handleShare = async () => {
    const shareData = {
      title: 'Faymox',
      text: shareText,
      url: 'https://faymox.com',
    };

    // 尝试使用原生分享 API
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 用户取消或不支持，继续使用复制链接
      }
    }

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(`${shareText} https://faymox.com`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 复制失败
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="border-white/20 text-white hover:bg-white/10"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          {locale === 'zh' ? '已复制' : 'Copied!'}
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          {t.share}
        </>
      )}
    </Button>
  );
}
