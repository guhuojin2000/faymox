'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from '@/lib/locale-context';

interface Barrage {
  id: string;
  text: string;
  isPremium: boolean;
  isHighlight: boolean;
  top: number;
  duration: number;
  delay: number;
}

interface BarrageSystemProps {
  onNewSupport?: (amount: number) => void;
}

const PREMIUM_BARRAGE_POOL = [
  { zh: '匿名极客：我的支持已转化为 100 个引力单位！', en: 'Anonymous Geek: Support converted to 100 Gravity Units!' },
  { zh: '一位探索者注入了能量，地球转速 +0.01！', en: 'An explorer injected energy, Earth velocity +0.01!' },
  { zh: '感谢支持！开发者获得了新的灵感火花 ✨', en: 'Thanks for support! Dev got a new spark of inspiration ✨' },
  { zh: '能量已转化为地球动力，引力场增强！', en: 'Energy converted to Earth momentum, gravity field enhanced!' },
  { zh: '一位星际旅行者留下了加速印记...', en: 'An interstellar traveler left an acceleration mark...' },
  { zh: '量子纠缠已确认，支持能量已传输！', en: 'Quantum entanglement confirmed, support energy transmitted!' },
];

const RANDOM_BARRAGE_POOL = [
  { zh: '编译时间缩短，转速加一', en: 'Compile time reduced, rotation +1' },
  { zh: '我在地球赤道拉了个响指', en: 'Snapped my fingers at the equator' },
  { zh: '模型推荐：稍微快一点', en: 'Deep learning model recommends slightly more velocity' },
  { zh: '调试中...转速优化中...', en: 'Debugging... optimizing rotation...' },
  { zh: '这行代码让世界转起来', en: 'This code makes the world spin' },
  { zh: '宇宙不在乎你转多快', en: "The universe doesn't care how fast you spin" },
  { zh: '物理定律说：可以更快', en: 'Physics says: can go faster' },
  { zh: '熵增？不，我们减熵', en: 'Entropy? No, we reduce it' },
  { zh: '光速太慢，地球先转', en: 'Light is slow, let Earth spin first' },
  { zh: '我的GPU在为地球加速', en: 'My GPU is accelerating Earth' },
  { zh: '404: 正常速度未找到', en: '404: Normal speed not found' },
  { zh: '这一行代码价值连城', en: 'This line of code is priceless' },
  { zh: '正在计算最优转速...', en: 'Calculating optimal rotation...' },
  { zh: '地球：我还能转更快', en: 'Earth: I can spin faster' },
  { zh: '量子叠加状态已确定，速度 +1', en: 'Quantum superposition finalized, speed +1' },
  { zh: '我们在宇宙边缘扔了个响指', en: 'We snapped at the edge of the universe' },
  { zh: 'AI 正在推荐更激进的旋转', en: 'AI is recommending a slightly more aggressive spin' },
  { zh: '暗能量已接入，加速中...', en: 'Dark energy connected, accelerating...' },
  { zh: '引力波已检测，速度波动中', en: 'Gravitational waves detected, speed fluctuating' },
  { zh: '曲速引擎预热中...', en: 'Warp drive preheating...' },
  { zh: '开发者在观察地球...', en: 'Developer is watching Earth...' },
  { zh: '灵感加载中 99%...', en: 'Inspiration loading 99%...' },
  { zh: '这是一个 feature，不是 bug', en: "It's a feature, not a bug" },
];

let aiBarrageCache: Array<{ zh: string; en: string }> = [];
let isLoadingCache = false;

async function loadAiBarrageCache() {
  if (isLoadingCache || aiBarrageCache.length > 5) return;
  
  isLoadingCache = true;
  try {
    const response = await fetch('/api/barrage?type=random');
    const data = await response.json();
    if (data.success && data.barrages) {
      aiBarrageCache = [...aiBarrageCache, ...data.barrages];
    }
  } catch {
    // 使用预设弹幕
  }
  isLoadingCache = false;
}

export default function BarrageSystem({ onNewSupport }: BarrageSystemProps) {
  const { locale } = useLocale();
  const [barrages, setBarrages] = useState<Barrage[]>([]);
  const barrageIdRef = useRef(0);

  const addBarrage = useCallback((text: string, isPremium: boolean = false, isHighlight: boolean = false) => {
    const id = `barrage-${barrageIdRef.current++}`;
    const top = isHighlight ? 35 + Math.random() * 20 : 10 + Math.random() * 50;
    const duration = isHighlight ? 12 : (isPremium ? 15 + Math.random() * 5 : 12 + Math.random() * 8);
    const delay = Math.random() * 0.3;

    setBarrages(prev => [...prev, { id, text, isPremium, isHighlight, top, duration, delay }]);
  }, []);

  const removeBarrage = useCallback((id: string) => {
    setBarrages(prev => prev.filter(b => b.id !== id));
  }, []);

  const getRandomBarrageFromCache = useCallback(() => {
    if (aiBarrageCache.length > 0) {
      const barrage = aiBarrageCache.shift()!;
      loadAiBarrageCache();
      return barrage;
    }
    return RANDOM_BARRAGE_POOL[Math.floor(Math.random() * RANDOM_BARRAGE_POOL.length)];
  }, []);

  useEffect(() => {
    const addRandomBarrage = () => {
      const barrage = getRandomBarrageFromCache();
      const text = locale === 'zh' ? barrage.zh : barrage.en;
      addBarrage(text, false, false);
    };

    loadAiBarrageCache();

    setTimeout(() => addRandomBarrage(), 1500);
    setTimeout(() => addRandomBarrage(), 4000);
    setTimeout(() => addRandomBarrage(), 7000);

    const interval = setInterval(() => {
      if (Math.random() > 0.2) {
        addRandomBarrage();
      }
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [addBarrage, locale, getRandomBarrageFromCache]);

  const addSupportBarrage = useCallback((text: string) => {
    addBarrage(text, true, false);
  }, [addBarrage]);

  const addHighlightBarrage = useCallback((text: string) => {
    addBarrage(text, true, true);
  }, [addBarrage]);

  useEffect(() => {
    if (onNewSupport) {
      (window as unknown as { addSupportBarrage: (text: string) => void }).addSupportBarrage = addSupportBarrage;
    }
    (window as unknown as { addHighlightBarrage: (text: string) => void }).addHighlightBarrage = addHighlightBarrage;
  }, [addSupportBarrage, addHighlightBarrage, onNewSupport]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {barrages.map((barrage) => (
        <div
          key={barrage.id}
          className={`
            absolute whitespace-nowrap
            ${barrage.isHighlight 
              ? 'text-base md:text-xl font-bold' 
              : barrage.isPremium 
                ? 'text-sm md:text-lg font-bold'
                : 'text-sm md:text-base font-light'}
          `}
          style={{
            top: `${barrage.top}%`,
            left: '100%',
            animation: `barrage-scroll ${barrage.duration}s linear forwards`,
            animationDelay: `${barrage.delay}s`,
            background: barrage.isHighlight 
              ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.15), transparent)'
              : 'transparent',
            borderRadius: barrage.isHighlight ? '20px' : '0',
            padding: barrage.isHighlight ? '8px 20px' : '0',
            color: barrage.isHighlight 
              ? '#00ffff'
              : barrage.isPremium 
                ? 'transparent'
                : 'rgba(255, 255, 255, 0.5)',
            backgroundClip: barrage.isPremium && !barrage.isHighlight ? 'text' : 'border-box',
            WebkitBackgroundClip: barrage.isPremium && !barrage.isHighlight ? 'text' : 'border-box',
            backgroundImage: barrage.isPremium && !barrage.isHighlight 
              ? 'linear-gradient(90deg, #f472b6, #fde047, #f472b6)'
              : 'none',
            textShadow: barrage.isHighlight 
              ? '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.2)'
              : barrage.isPremium 
                ? '0 0 20px rgba(255, 100, 200, 0.8), 0 0 40px rgba(255, 200, 100, 0.5)'
                : '0 0 10px rgba(0, 0, 0, 0.8)',
            filter: barrage.isHighlight 
              ? 'brightness(1.3) drop-shadow(0 0 10px cyan)'
              : barrage.isPremium 
                ? 'brightness(1.2)'
                : 'none',
            border: barrage.isHighlight ? '1px solid rgba(0, 255, 255, 0.3)' : 'none',
            boxShadow: barrage.isHighlight 
              ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
              : 'none',
          }}
          onAnimationEnd={() => removeBarrage(barrage.id)}
        >
          {barrage.isHighlight && (
            <span className="inline-block mr-2 animate-pulse">💫</span>
          )}
          {barrage.isPremium && !barrage.isHighlight && (
            <span className="inline-block mr-2 animate-pulse">✨</span>
          )}
          {barrage.text}
          {barrage.isPremium && !barrage.isHighlight && (
            <span className="inline-block ml-2 animate-pulse">✨</span>
          )}
          {barrage.isHighlight && (
            <span className="inline-block ml-2 animate-pulse">💫</span>
          )}
        </div>
      ))}
      
      <style jsx global>{`
        @keyframes barrage-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100vw - 100%));
          }
        }
      `}</style>
    </div>
  );
}

export function triggerSupportBarrage(text: string) {
  const fn = (window as unknown as { addSupportBarrage?: (text: string) => void }).addSupportBarrage;
  if (fn) fn(text);
}

export function triggerHighlightBarrage(text: string) {
  const fn = (window as unknown as { addHighlightBarrage?: (text: string) => void }).addHighlightBarrage;
  if (fn) fn(text);
}

export function getPremiumBarrage(amount: number): { zh: string; en: string } {
  if (amount >= 50) {
    return {
      zh: `🌟 超级支持者注入了 ${amount} 引力单位！地球感受到强大的能量波动！`,
      en: `🌟 Super supporter injected ${amount} Gravity Units! Earth senses powerful energy waves!`,
    };
  }
  return PREMIUM_BARRAGE_POOL[Math.floor(Math.random() * PREMIUM_BARRAGE_POOL.length)];
}
