'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LocaleProvider, useLocale } from '@/lib/locale-context';
import ControlPanel from '@/components/control-panel';
import BarrageSystem, { triggerSupportBarrage, getPremiumBarrage } from '@/components/barrage-system';
import LocaleSwitcher from '@/components/locale-switcher';
import ShareButton from '@/components/share-button';
import DynamicTagline from '@/components/dynamic-tagline';
import DeveloperStatus from '@/components/developer-status';
import ChiefScientist from '@/components/chief-scientist';
import { Globe, Volume2, VolumeX, Languages } from 'lucide-react';

// 动态导入 3D 场景
const EarthScene = dynamic(() => import('@/components/earth-scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  ),
});

// 获取初始数据
async function fetchInitialStats(): Promise<{ velocity: number; isOverThousand: boolean }> {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();
    return {
      velocity: data.velocity ?? 1,
      isOverThousand: data.isOverThousand ?? false,
    };
  } catch {
    return { velocity: 1, isOverThousand: false };
  }
}

// 侧边工具栏组件
function SidebarToolbar({ 
  soundEnabled, 
  onToggleSound 
}: { 
  soundEnabled: boolean; 
  onToggleSound: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* 音效开关 */}
      <button
        onClick={onToggleSound}
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center
          bg-slate-900/80 backdrop-blur-md border border-white/10
          transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/90
          ${expanded ? 'w-auto px-4 gap-2' : ''}
        `}
        title={soundEnabled ? '关闭音效' : '开启音效'}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 text-cyan-400" />
        ) : (
          <VolumeX className="w-4 h-4 text-white/50" />
        )}
        {expanded && (
          <span className="text-xs text-white/70 whitespace-nowrap">
            {soundEnabled ? '音效开启' : '音效关闭'}
          </span>
        )}
      </button>
      
      {/* 语言切换 */}
      <div className={`
        relative w-10 h-10 rounded-full flex items-center justify-center
        bg-slate-900/80 backdrop-blur-md border border-white/10
        transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/90
        ${expanded ? 'w-auto px-4' : ''}
      `}>
        <Languages className="w-4 h-4 text-cyan-400" />
        {expanded && (
          <div className="ml-2">
            <LocaleSwitcher />
          </div>
        )}
      </div>
      
      {/* 地球状态 */}
      <button
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center
          bg-slate-900/80 backdrop-blur-md border border-white/10
          transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/90
          cursor-default
          ${expanded ? 'w-auto px-4 gap-2' : ''}
        `}
      >
        <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
        {expanded && (
          <span className="text-xs text-white/70 whitespace-nowrap">
            地球运行中
          </span>
        )}
      </button>
    </div>
  );
}

function FaymoxContent() {
  const { t, locale } = useLocale();
  const [velocity, setVelocity] = useState(1);
  const [isOverThousand, setIsOverThousand] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 播放增强音效
  const playBoostSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // 1. 粒子流动音效 - 沙沙声上升
      const bufferSize = audioContext.sampleRate * 0.8;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 3) * 0.15 * (1 + t);
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(4000, audioContext.currentTime + 0.5);
      filter.Q.value = 2;
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      noise.start();
      noise.stop(audioContext.currentTime + 0.8);
      
      // 2. Sonic Boom 音效 - 延迟后播放
      setTimeout(() => {
        // 低频爆炸声
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(200, audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.start();
        osc1.stop(audioContext.currentTime + 0.4);
        
        // 高频冲击波
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(800, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
        
        // 白噪声冲击
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.03));
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain2 = audioContext.createGain();
        noiseGain2.gain.value = 0.3;
        noiseSource.connect(noiseGain2);
        noiseGain2.connect(audioContext.destination);
        noiseSource.start();
      }, 600);
      
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // 获取速度数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setVelocity(data.velocity);
      setIsOverThousand(data.isOverThousand);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // 初始化和定时刷新
  useEffect(() => {
    fetchInitialStats().then(data => {
      setVelocity(data.velocity);
      setIsOverThousand(data.isOverThousand);
    });
    
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // 生成支持弹幕 - 增强版
  const generateSupportBarrage = useCallback(async (amount: number, customMessage?: string) => {
    try {
      const response = await fetch('/api/barrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'support',
          amount,
          velocity,
          customMessage,
          locale,
        }),
      });
      const data = await response.json();
      if (data.success && data.barrage) {
        const text = locale === 'zh' ? data.barrage.zh : data.barrage.en;
        triggerSupportBarrage(text);
      }
    } catch {
      // Fallback - 使用预设高级弹幕
      const barrage = getPremiumBarrage(amount);
      const text = locale === 'zh' ? barrage.zh : barrage.en;
      triggerSupportBarrage(text);
    }
  }, [velocity, locale]);

  // 支付成功回调
  const handlePaymentSuccess = useCallback((amount: number, customMessage?: string) => {
    setLastAmount(amount);
    setShowBoost(true);
    playBoostSound();
    fetchStats();
    
    // 生成支持弹幕
    generateSupportBarrage(amount, customMessage);
    
    setTimeout(() => setShowBoost(false), 2000);
  }, [fetchStats, playBoostSound, generateSupportBarrage]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#000008]">
      {/* 3D 地球场景 */}
      <EarthScene 
        rotationSpeed={velocity} 
        isOverThousand={isOverThousand}
        showBoost={showBoost}
      />

      {/* 弹幕系统 */}
      <BarrageSystem />

      {/* 首席科学家 */}
      <ChiefScientist 
        velocity={velocity}
        lastAmount={lastAmount}
      />

      {/* 开发者状态浮窗 */}
      <DeveloperStatus />

      {/* 侧边工具栏 */}
      <SidebarToolbar 
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 顶部导航 */}
        <header className="flex items-center px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Faymox
          </h1>
        </header>

        {/* 主要内容区 - 地球和文案 */}
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          {/* 核心文案 - 动态打字机效果 */}
          <div className="mb-8">
            <DynamicTagline />
          </div>

          {/* 彩蛋提示 */}
          {isOverThousand && (
            <div className="mb-4 text-cyan-300 text-sm animate-pulse flex items-center gap-2">
              <span className="text-lg">✨</span>
              {locale === 'zh' ? '地球已进入超速模式！' : 'Earth has entered hyper-speed mode!'}
              <span className="text-lg">✨</span>
            </div>
          )}
        </main>

        {/* 底部控制台 */}
        <footer className="flex flex-col items-center gap-4 px-4 py-6 md:py-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <ControlPanel 
            currentVelocity={velocity}
            onPaymentSuccess={handlePaymentSuccess}
          />

          {/* 分享按钮 */}
          {lastAmount > 0 && (
            <ShareButton amount={lastAmount} velocity={velocity} />
          )}

          {/* 版权信息 */}
          <div className="flex flex-col items-center gap-1 mt-4 text-white/30 text-xs">
            <p>{t.poweredBy}</p>
            <p>© {new Date().getFullYear()} Faymox</p>
          </div>
        </footer>
      </div>

      {/* 全屏加速光环效果 - 增强 */}
      {showBoost && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {/* 能量冲击波 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[200vmax] h-[200vmax] rounded-full border-4 border-cyan-400/40 animate-ping-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
            <div className="w-[180vmax] h-[180vmax] rounded-full border-2 border-pink-400/30 animate-ping-slow" style={{ animationDelay: '0.15s' }} />
          </div>
          {/* 径向渐变 */}
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/15 via-pink-500/5 to-transparent animate-pulse" />
          {/* 星尘粒子 */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-stardust"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ping-slow {
          0% {
            transform: scale(0.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
        }
        @keyframes stardust {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(-100px);
            opacity: 0;
          }
        }
        .animate-stardust {
          animation: stardust 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <LocaleProvider>
      <FaymoxContent />
    </LocaleProvider>
  );
}
