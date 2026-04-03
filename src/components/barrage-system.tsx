'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from '@/lib/locale-context';

interface Barrage {
  id: string;
  text: string;
  isPremium: boolean;
  top: number;
  duration: number;
  delay: number;
}

interface BarrageSystemProps {
  onNewSupport?: (amount: number) => void;
}

// 预设弹幕池 - 极客风格
const PREMIUM_BARRAGE_POOL = [
  { zh: '匿名极客：我的支持已转化为 100 个引力单位！', en: 'Anonymous Geek: Support converted to 100 Gravity Units!' },
  { zh: '一位探索者注入了能量，地球转速 +0.01！', en: 'An explorer injected energy, Earth velocity +0.01!' },
  { zh: '感谢支持！开发者获得了新的灵感火花 ✨', en: 'Thanks for support! Dev got a new spark of inspiration ✨' },
  { zh: '能量已转化为地球动力，引力场增强！', en: 'Energy converted to Earth momentum, gravity field enhanced!' },
  { zh: '一位星际旅行者留下了加速印记...', en: 'An interstellar traveler left an acceleration mark...' },
  { zh: '量子纠缠已确认，支持能量已传输！', en: 'Quantum entanglement confirmed, support energy transmitted!' },
];

const RANDOM_BARRAGE_POOL = [
  // 极客幽默
  { zh: '编译时间缩短，转速加一', en: 'Compile time reduced, rotation +1' },
  { zh: '我在地球赤道拉了个响指', en: 'Snapped my fingers at the equator' },
  { zh: '模型推荐：稍微快一点', en: 'Deep learning model recommends slightly more velocity' },
  { zh: '调试中...转速优化中...', en: 'Debugging... optimizing rotation...' },
  { zh: '这行代码让世界转起来', en: 'This code makes the world spin' },
  
  // 哲学/自嘲
  { zh: '宇宙不在乎你转多快', en: "The universe doesn't care how fast you spin" },
  { zh: '物理定律说：可以更快', en: 'Physics says: can go faster' },
  { zh: '熵增？不，我们减熵', en: 'Entropy? No, we reduce it' },
  { zh: '光速太慢，地球先转', en: 'Light is slow, let Earth spin first' },
  { zh: '我的GPU在为地球加速', en: 'My GPU is accelerating Earth' },
  
  // 404/开发梗
  { zh: '404: 正常速度未找到', en: '404: Normal speed not found' },
  { zh: '这一行代码价值连城', en: 'This line of code is priceless' },
  { zh: '正在计算最优转速...', en: 'Calculating optimal rotation...' },
  { zh: '地球：我还能转更快', en: 'Earth: I can spin faster' },
  
  // 新增 - 量子/科幻
  { zh: '量子叠加状态已确定，速度 +1', en: 'Quantum superposition finalized, speed +1' },
  { zh: '我们在宇宙边缘扔了个响指', en: 'We snapped at the edge of the universe' },
  { zh: 'AI 正在推荐更激进的旋转', en: 'AI is recommending a slightly more aggressive spin' },
  { zh: '暗能量已接入，加速中...', en: 'Dark energy connected, accelerating...' },
  { zh: '引力波已检测，速度波动中', en: 'Gravitational waves detected, speed fluctuating' },
  { zh: '曲速引擎预热中...', en: 'Warp drive preheating...' },
  
  // 开发者状态
  { zh: '开发者在观察地球...', en: 'Developer is watching Earth...' },
  { zh: '灵感加载中 99%...', en: 'Inspiration loading 99%...' },
  { zh: '这是一个 feature，不是 bug', en: "It's a feature, not a bug" },
];

// AI弹幕缓存池
let aiBarrageCache: Array<{ zh: string; en: string }> = [];
let isLoadingCache = false;

// 加载AI弹幕到缓存
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

  // 添加弹幕
  const addBarrage = useCallback((text: string, isPremium: boolean = false) => {
    const id = `barrage-${barrageIdRef.current++}`;
    const top = 10 + Math.random() * 50; // 10% - 60% from top
    const duration = isPremium ? 15 + Math.random() * 5 : 12 + Math.random() * 8;
    const delay = Math.random() * 0.5;

    setBarrages(prev => [...prev, { id, text, isPremium, top, duration, delay }]);
  }, []);

  // 移除弹幕
  const removeBarrage = useCallback((id: string) => {
    setBarrages(prev => prev.filter(b => b.id !== id));
  }, []);

  // 从缓存获取随机弹幕
  const getRandomBarrageFromCache = useCallback(() => {
    if (aiBarrageCache.length > 0) {
      const barrage = aiBarrageCache.shift()!;
      // 补充缓存
      loadAiBarrageCache();
      return barrage;
    }
    // 缓存为空，使用预设
    return RANDOM_BARRAGE_POOL[Math.floor(Math.random() * RANDOM_BARRAGE_POOL.length)];
  }, []);

  // 定时添加随机弹幕
  useEffect(() => {
    const addRandomBarrage = () => {
      const barrage = getRandomBarrageFromCache();
      const text = locale === 'zh' ? barrage.zh : barrage.en;
      addBarrage(text, false);
    };

    // 初始加载缓存
    loadAiBarrageCache();

    // 初始添加几条
    setTimeout(() => addRandomBarrage(), 1500);
    setTimeout(() => addRandomBarrage(), 4000);
    setTimeout(() => addRandomBarrage(), 7000);

    // 每 5-10 秒添加一条
    const interval = setInterval(() => {
      if (Math.random() > 0.2) { // 80% 概率
        addRandomBarrage();
      }
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [addBarrage, locale, getRandomBarrageFromCache]);

  // 添加支持弹幕（暴露给外部）
  const addSupportBarrage = useCallback((text: string) => {
    addBarrage(text, true);
  }, [addBarrage]);

  // 暴露方法给父组件
  useEffect(() => {
    if (onNewSupport) {
      (window as unknown as { addSupportBarrage: (text: string) => void }).addSupportBarrage = addSupportBarrage;
    }
  }, [addSupportBarrage, onNewSupport]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {barrages.map((barrage) => (
        <div
          key={barrage.id}
          className={`
            absolute whitespace-nowrap text-sm md:text-base
            ${barrage.isPremium 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-pink-400 font-bold text-base md:text-lg' 
              : 'text-white/50 font-light'}
          `}
          style={{
            top: `${barrage.top}%`,
            left: '100%',
            animation: `barrage-scroll ${barrage.duration}s linear forwards`,
            animationDelay: `${barrage.delay}s`,
            textShadow: barrage.isPremium 
              ? '0 0 20px rgba(255, 100, 200, 0.8), 0 0 40px rgba(255, 200, 100, 0.5), 0 0 60px rgba(255, 150, 200, 0.3)' 
              : '0 0 10px rgba(0, 0, 0, 0.8)',
            filter: barrage.isPremium ? 'brightness(1.2)' : 'none',
          }}
          onAnimationEnd={() => removeBarrage(barrage.id)}
        >
          {barrage.isPremium && (
            <span className="inline-block mr-2 animate-pulse">✨</span>
          )}
          {barrage.text}
          {barrage.isPremium && (
            <span className="inline-block ml-2 animate-pulse">✨</span>
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

// 导出添加支持弹幕的函数
export function triggerSupportBarrage(text: string) {
  const fn = (window as unknown as { addSupportBarrage?: (text: string) => void }).addSupportBarrage;
  if (fn) fn(text);
}

// 导出获取高级弹幕的函数
export function getPremiumBarrage(amount: number): { zh: string; en: string } {
  if (amount >= 50) {
    return {
      zh: `🌟 超级支持者注入了 ${amount} 引力单位！地球感受到强大的能量波动！`,
      en: `🌟 Super supporter injected ${amount} Gravity Units! Earth senses powerful energy waves!`,
    };
  }
  return PREMIUM_BARRAGE_POOL[Math.floor(Math.random() * PREMIUM_BARRAGE_POOL.length)];
}
