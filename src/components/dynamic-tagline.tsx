'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale } from '@/lib/locale-context';

type AnimationType = 
  | 'slideFromLeft' 
  | 'slideFromRight' 
  | 'slideFromTop' 
  | 'slideFromBottom'
  | 'flyFromTopLeft'
  | 'flyFromTopRight'
  | 'flyFromBottomLeft'
  | 'flyFromBottomRight'
  | 'scaleFromCenter'
  | 'scatterAssemble'
  | 'typewriter'
  | 'bounceIn';

const animationTypes: AnimationType[] = [
  'slideFromLeft',
  'slideFromRight', 
  'slideFromTop',
  'slideFromBottom',
  'flyFromTopLeft',
  'flyFromTopRight',
  'flyFromBottomLeft',
  'flyFromBottomRight',
  'scaleFromCenter',
  'scatterAssemble',
  'typewriter',
  'bounceIn',
];

const fonts = [
  'sans-serif',
  'serif',
  'monospace',
  'Georgia',
  'Arial',
  'Verdana',
];

interface CharState {
  char: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  font: string;
  delay: number;
}

function getRandomAnimation(): AnimationType {
  return animationTypes[Math.floor(Math.random() * animationTypes.length)];
}

function getInitialCharStates(text: string, animationType: AnimationType): CharState[] {
  return text.split('').map((char, index) => {
    let x = 0, y = 0, rotation = 0, scale = 1, opacity = 0;
    
    switch (animationType) {
      case 'slideFromLeft':
        x = -100 - Math.random() * 50;
        opacity = 0;
        break;
      case 'slideFromRight':
        x = 100 + Math.random() * 50;
        opacity = 0;
        break;
      case 'slideFromTop':
        y = -80 - Math.random() * 40;
        opacity = 0;
        break;
      case 'slideFromBottom':
        y = 80 + Math.random() * 40;
        opacity = 0;
        break;
      case 'flyFromTopLeft':
        x = -150 - Math.random() * 100;
        y = -150 - Math.random() * 100;
        rotation = -30 - Math.random() * 30;
        scale = 0.5;
        opacity = 0;
        break;
      case 'flyFromTopRight':
        x = 150 + Math.random() * 100;
        y = -150 - Math.random() * 100;
        rotation = 30 + Math.random() * 30;
        scale = 0.5;
        opacity = 0;
        break;
      case 'flyFromBottomLeft':
        x = -150 - Math.random() * 100;
        y = 150 + Math.random() * 100;
        rotation = -30 - Math.random() * 30;
        scale = 0.5;
        opacity = 0;
        break;
      case 'flyFromBottomRight':
        x = 150 + Math.random() * 100;
        y = 150 + Math.random() * 100;
        rotation = 30 + Math.random() * 30;
        scale = 0.5;
        opacity = 0;
        break;
      case 'scaleFromCenter':
        scale = 0;
        opacity = 0;
        break;
      case 'scatterAssemble':
        x = (Math.random() - 0.5) * 400;
        y = (Math.random() - 0.5) * 200;
        rotation = (Math.random() - 0.5) * 180;
        scale = 0.3 + Math.random() * 0.5;
        opacity = 0;
        break;
      case 'typewriter':
        opacity = 0;
        break;
      case 'bounceIn':
        y = -200 - Math.random() * 100;
        rotation = (Math.random() - 0.5) * 60;
        scale = 0.5;
        opacity = 0;
        break;
    }
    
    return {
      char,
      x,
      y,
      rotation,
      scale,
      opacity,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      delay: index * 30 + Math.random() * 50,
    };
  });
}

export default function DynamicTagline() {
  const { locale } = useLocale();
  const [animationType, setAnimationType] = useState<AnimationType>('typewriter');
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const fullText = locale === 'zh' 
    ? '既然还没想好做什么，不如先让地球转快点吧。'
    : "The developer hasn't decided what to build yet, so let's speed up the Earth together.";

  const startAnimation = useCallback(() => {
    const newAnimationType = getRandomAnimation();
    setAnimationType(newAnimationType);
    setDisplayText('');
    setIsAnimating(true);
    
    const initialStates = getInitialCharStates(fullText, newAnimationType);
    setCharStates(initialStates);
    
    if (newAnimationType === 'typewriter') {
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsAnimating(false);
          clearInterval(typeInterval);
        }
      }, 50);
      return () => clearInterval(typeInterval);
    } else {
      setTimeout(() => {
        setCharStates(prev => prev.map((state, index) => ({
          ...state,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          delay: index * 25 + Math.random() * 30,
        })));
      }, 100);
      
      const maxDelay = fullText.length * 25 + 500;
      setTimeout(() => {
        setIsAnimating(false);
      }, maxDelay);
    }
  }, [fullText]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => (prev + 0.05) % 1);
    }, 50);
    return () => clearInterval(glowInterval);
  }, []);

  const glowOpacity = 0.3 + Math.sin(glowIntensity * Math.PI * 2) * 0.15;

  const renderChars = useMemo(() => {
    if (animationType === 'typewriter') {
      return (
        <span className="text-white/70">
          {displayText}
        </span>
      );
    }
    
    return charStates.map((state, index) => (
      <span
        key={index}
        className="inline-block"
        style={{
          transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg) scale(${state.scale})`,
          opacity: state.opacity,
          fontFamily: state.font,
          transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${state.delay}ms`,
          textShadow: state.opacity > 0.5 
            ? `0 0 10px rgba(100, 200, 255, 0.5)` 
            : 'none',
        }}
      >
        {state.char}
      </span>
    ));
  }, [animationType, charStates, displayText]);

  return (
    <div className="relative text-center px-4">
      <div 
        className="absolute inset-0 blur-xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(100, 200, 255, ${glowOpacity * 0.3}) 0%, transparent 70%)`,
        }}
      />
      
      <p 
        className="relative text-base md:text-xl max-w-xl leading-relaxed font-light tracking-wide"
        style={{
          textShadow: `0 0 ${20 + glowIntensity * 10}px rgba(100, 200, 255, ${glowOpacity})`,
        }}
      >
        <span className="text-white/70">
          {renderChars}
        </span>
        <span 
          className={`inline-block w-[2px] h-[1.1em] ml-[2px] align-middle transition-opacity duration-100 ${
            showCursor && isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundColor: `rgba(100, 200, 255, ${0.5 + glowIntensity * 0.3})`,
            boxShadow: `0 0 8px rgba(100, 200, 255, 0.8)`,
          }}
        />
      </p>

      {!isAnimating && (
        <span 
          className="inline-block mt-2 text-xs text-cyan-400/60 animate-pulse"
        >
          ▼
        </span>
      )}
    </div>
  );
}
