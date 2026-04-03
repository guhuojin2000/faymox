'use client';

import { useEffect, useState, useRef } from 'react';
import { useLocale } from '@/lib/locale-context';

interface VelocityDisplayProps {
  velocity: number; // 圈/天
  isOverThousand: boolean;
}

export default function VelocityDisplay({ velocity, isOverThousand }: VelocityDisplayProps) {
  const { t } = useLocale();
  const [displayVelocity, setDisplayVelocity] = useState(velocity);
  const [digitChanges, setDigitChanges] = useState<{ [key: number]: boolean }>({});
  const prevVelocityRef = useRef(velocity);

  // 平滑过渡动画
  useEffect(() => {
    const startValue = prevVelocityRef.current;
    const endValue = velocity;
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easeOutExpo 缓动函数
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      
      setDisplayVelocity(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevVelocityRef.current = velocity;
      }
    };

    requestAnimationFrame(animate);
  }, [velocity]);

  // 数字跳动效果
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机触发某些数字位的跳动
      const randomDigit = Math.floor(Math.random() * 6);
      setDigitChanges(prev => ({ ...prev, [randomDigit]: true }));
      setTimeout(() => {
        setDigitChanges(prev => ({ ...prev, [randomDigit]: false }));
      }, 100);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // 格式化数字为两位小数
  const formattedVelocity = displayVelocity.toFixed(2);
  const integerPart = formattedVelocity.split('.')[0];
  const decimalPart = formattedVelocity.split('.')[1];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-sm md:text-base font-medium tracking-wider uppercase transition-colors duration-500 ${
        isOverThousand ? 'text-cyan-400' : 'text-white/60'
      }`}>
        {t.currentVelocity}
      </div>
      
      <div className="flex items-baseline gap-1">
        <div className={`font-mono text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight transition-all duration-500 ${
          isOverThousand 
            ? 'text-cyan-300 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]' 
            : 'text-white'
        }`}>
          {integerPart.split('').map((digit, i) => (
            <span
              key={`int-${i}`}
              className={`inline-block transition-transform duration-100 ${
                digitChanges[i] ? 'translate-y-[-2px]' : ''
              }`}
            >
              {digit}
            </span>
          ))}
          <span className="text-white/40">.</span>
          {decimalPart.split('').map((digit, i) => (
            <span
              key={`dec-${i}`}
              className={`inline-block transition-transform duration-100 ${
                digitChanges[i + integerPart.length] ? 'translate-y-[-2px]' : ''
              }`}
            >
              {digit}
            </span>
          ))}
        </div>
        
        <div className={`text-sm md:text-lg font-medium transition-colors duration-500 ${
          isOverThousand ? 'text-cyan-400' : 'text-white/60'
        }`}>
          {t.rotationsPerDay}
        </div>
      </div>
      
      {/* 速度指示条 */}
      <div className="w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isOverThousand 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]' 
              : 'bg-gradient-to-r from-white/30 to-white/50'
          }`}
          style={{ width: `${Math.min((velocity / 2000) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
