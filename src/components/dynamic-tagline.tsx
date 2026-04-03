'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale } from '@/lib/locale-context';

// 可用的随机字体列表
const fonts = [
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'Georgia',
  'Palatino',
  'Times New Roman',
  'Arial',
  'Verdana',
  'Courier New',
];

interface CharState {
  char: string;
  y: number;
  rotation: number;
  scale: number;
  font: string;
  delay: number;
  isJumping: boolean;
}

export default function DynamicTagline() {
  const { locale } = useLocale();
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  
  const fullText = locale === 'zh' 
    ? '既然还没想好做什么，不如先让地球转快点吧。'
    : "The developer hasn't decided what to build yet, so let's speed up the Earth together.";

  // 初始化字符状态
  const initCharStates = useCallback((text: string): CharState[] => {
    return text.split('').map((char, index) => ({
      char,
      y: 0,
      rotation: 0,
      scale: 1,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      delay: index * 30 + Math.random() * 100,
      isJumping: false,
    }));
  }, []);

  // 打字机效果
  useEffect(() => {
    setDisplayText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        // 打字完成后初始化字符状态
        setCharStates(initCharStates(fullText));
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, [fullText, initCharStates]);

  // 光标闪烁
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // 发光脉冲效果
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        const next = prev + 0.05;
        return next > 1 ? 0 : next;
      });
    }, 50);

    return () => clearInterval(glowInterval);
  }, []);

  // 随机蹦跳动画 - 每30秒触发
  const triggerJumpAnimation = useCallback(() => {
    if (isTyping || isJumping) return;
    
    setIsJumping(true);
    
    // 为每个字符创建随机动画参数
    const newStates = fullText.split('').map((char, index) => {
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      const jumpHeight = -20 - Math.random() * 40; // 随机跳跃高度
      const rotation = (Math.random() - 0.5) * 60; // 随机旋转角度
      const delay = index * 20 + Math.random() * 150; // 错开延迟
      
      return {
        char,
        y: 0,
        rotation: 0,
        scale: 1,
        font: randomFont,
        delay,
        isJumping: true,
        targetY: jumpHeight,
        targetRotation: rotation,
      };
    });
    
    // 第一阶段：跳跃动画
    newStates.forEach((state, index) => {
      setTimeout(() => {
        setCharStates(prev => {
          const newPrev = [...prev];
          if (newPrev[index]) {
            newPrev[index] = {
              ...newPrev[index],
              y: state.targetY!,
              rotation: state.targetRotation!,
              scale: 1.2,
              font: state.font,
              isJumping: true,
            };
          }
          return newPrev;
        });
      }, state.delay);
    });
    
    // 第二阶段：落下动画
    const maxDelay = Math.max(...newStates.map(s => s.delay)) + 300;
    setTimeout(() => {
      newStates.forEach((state, index) => {
        setTimeout(() => {
          setCharStates(prev => {
            const newPrev = [...prev];
            if (newPrev[index]) {
              newPrev[index] = {
                ...newPrev[index],
                y: 0,
                rotation: 0,
                scale: 1,
                isJumping: false,
              };
            }
            return newPrev;
          });
        }, index * 15);
      });
    }, maxDelay + 400);
    
    // 结束跳跃状态
    setTimeout(() => {
      setIsJumping(false);
    }, maxDelay + 1000);
  }, [fullText, isTyping, isJumping]);

  // 每30秒触发一次蹦跳
  useEffect(() => {
    if (isTyping) return;
    
    // 首次延迟5秒后开始
    const initialTimeout = setTimeout(() => {
      triggerJumpAnimation();
    }, 5000);
    
    const interval = setInterval(() => {
      triggerJumpAnimation();
    }, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isTyping, triggerJumpAnimation]);

  // 计算动态发光颜色
  const glowOpacity = 0.3 + Math.sin(glowIntensity * Math.PI * 2) * 0.15;

  // 渲染带动画的字符
  const renderAnimatedChars = useMemo(() => {
    if (charStates.length === 0) {
      return <span className="text-white/70">{displayText}</span>;
    }
    
    return charStates.map((state, index) => (
      <span
        key={index}
        className="inline-block transition-all duration-300 ease-out"
        style={{
          transform: `translateY(${state.y}px) rotate(${state.rotation}deg) scale(${state.scale})`,
          fontFamily: state.font,
          textShadow: state.isJumping 
            ? `0 0 10px rgba(100, 200, 255, 0.8), 0 0 20px rgba(100, 200, 255, 0.4)`
            : undefined,
          transitionTimingFunction: state.isJumping ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'ease-out',
        }}
      >
        {state.char}
      </span>
    ));
  }, [charStates, displayText]);

  return (
    <div className="relative text-center px-4">
      {/* 背景光晕 */}
      <div 
        className="absolute inset-0 blur-xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(100, 200, 255, ${glowOpacity * 0.3}) 0%, transparent 70%)`,
        }}
      />
      
      {/* 主文字 */}
      <p 
        className="relative text-base md:text-xl max-w-xl leading-relaxed font-light tracking-wide"
        style={{
          textShadow: `0 0 ${20 + glowIntensity * 10}px rgba(100, 200, 255, ${glowOpacity})`,
        }}
      >
        <span className="text-white/70">
          {renderAnimatedChars}
        </span>
        {/* 打字光标 */}
        <span 
          className={`inline-block w-[2px] h-[1.1em] ml-[2px] align-middle transition-opacity duration-100 ${
            showCursor && (isTyping || displayText.length < fullText.length) ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundColor: `rgba(100, 200, 255, ${0.5 + glowIntensity * 0.3})`,
            boxShadow: `0 0 8px rgba(100, 200, 255, 0.8)`,
          }}
        />
      </p>

      {/* 打字完成后的脉冲提示 */}
      {!isTyping && displayText.length >= fullText.length && (
        <span 
          className="inline-block mt-2 text-xs text-cyan-400/60 animate-pulse"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          ▼
        </span>
      )}
    </div>
  );
}
