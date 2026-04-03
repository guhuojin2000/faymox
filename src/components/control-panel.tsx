'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/lib/locale-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, Rocket, QrCode, Sparkles, Zap } from 'lucide-react';

interface ControlPanelProps {
  currentVelocity: number;
  onPaymentSuccess: (amount: number, customMessage?: string) => void;
}

// 能量粒子组件
function EnergyParticles({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 能量粒子流 - 从底部按钮流向中心地球 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-energy-particle"
          style={{
            left: '50%',
            bottom: '20%',
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#ff6b9d' : '#ffd700'} 0%, transparent 70%)`,
            boxShadow: `0 0 10px ${i % 2 === 0 ? '#ff6b9d' : '#ffd700'}, 0 0 20px ${i % 2 === 0 ? '#ff6b9d' : '#ffd700'}`,
            animationDelay: `${i * 0.08}s`,
            animationDuration: `${1.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
      
      <style jsx global>{`
        @keyframes energy-particle {
          0% {
            transform: translate(-50%, 0) scale(0.5);
            opacity: 1;
          }
          50% {
            transform: translate(
              calc(-50% + ${(Math.random() - 0.5) * 200}px), 
              calc(-200vh + 50vh)
            ) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50vh) scale(0.2);
            opacity: 0;
          }
        }
        .animate-energy-particle {
          animation: energy-particle 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function ControlPanel({ currentVelocity, onPaymentSuccess }: ControlPanelProps) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 处理按钮点击
  const handleButtonClick = useCallback(() => {
    setShowParticles(true);
    // 播放粒子流动音效
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // 粒子流动声音 - 沙沙声
      const bufferSize = audioContext.sampleRate * 0.5;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3)) * 0.1;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      noise.start();
      noise.stop(audioContext.currentTime + 0.5);
      
      // Sonic Boom 音效
      setTimeout(() => {
        const osc = audioContext.createOscillator();
        const boomGain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.3);
        boomGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        boomGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.connect(boomGain);
        boomGain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
      }, 800);
    } catch {
      // Audio not supported
    }
    
    setTimeout(() => {
      setShowParticles(false);
      setOpen(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!open) {
      setCustomMessage('');
    }
  }, [open]);

  return (
    <>
      {/* 能量粒子效果 */}
      <EnergyParticles active={showParticles} />
      
      {/* 主控制面板 */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        {/* 标题 */}
        <div className="text-center mb-2">
          <h2 className="text-lg md:text-xl font-bold text-white/80 tracking-wider">
            {locale === 'zh' ? '项目代号：地球加速' : 'Project Earth Accelerator'}
          </h2>
        </div>

        {/* 速度显示 */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl md:text-5xl font-bold text-white tabular-nums">
            {currentVelocity.toFixed(2)}
          </span>
          <span className="text-white/50 text-sm md:text-base">
            {t.rotationsPerDay}
          </span>
        </div>

        {/* 速度条 */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentVelocity / 2000) * 100, 100)}%` }}
          />
        </div>

        {/* 支持开发者按钮 - 增强版 */}
        <Button
          onClick={handleButtonClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`
            w-full py-6 text-lg font-semibold 
            bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 
            hover:from-pink-400 hover:via-rose-400 hover:to-orange-300
            text-white shadow-lg shadow-pink-500/30 
            transition-all duration-300
            ${isHovering ? 'scale-[1.02] shadow-pink-500/50' : ''}
            ${showParticles ? 'scale-95 opacity-80' : ''}
            relative overflow-hidden group
          `}
        >
          {/* 按钮发光效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          <div className="flex flex-col items-center gap-1 relative z-10">
            <div className="flex items-center gap-2">
              <Heart className={`w-5 h-5 ${isHovering ? 'animate-pulse' : ''}`} />
              <span>{t.supportDeveloper}</span>
              <Rocket className={`w-4 h-4 transition-transform ${isHovering ? 'translate-x-1 -translate-y-0.5' : ''}`} />
            </div>
            {/* 子文本 - 并加速地球 */}
            <span className="text-xs opacity-80 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {locale === 'zh' ? '(并加速地球)' : '(+ Earth Velocity)'}
            </span>
          </div>
        </Button>
      </div>

      {/* 赞赏码弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-md border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              {t.supportDeveloper}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-6 space-y-4">
            {/* 赞赏码图片 */}
            <div className="bg-white p-4 rounded-2xl shadow-2xl relative">
              <img 
                src="/reward-qr.png"
                alt={locale === 'zh' ? '微信赞赏码' : 'WeChat Reward QR Code'}
                className="w-56 h-56 object-contain"
              />
              {/* 扫描线动画 */}
              <div className="absolute inset-4 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 to-transparent h-1/3 animate-scan" />
              </div>
            </div>
            
            {/* 引力宣言输入框 */}
            <div className="w-full space-y-2">
              <Input
                type="text"
                placeholder={locale === 'zh' 
                  ? '留下你的引力宣言（可选）' 
                  : 'Your gravity declaration (optional)'}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-slate-800 border-slate-600 focus:border-pink-500 text-white placeholder:text-white/30"
                maxLength={50}
              />
              <p className="text-xs text-white/40 text-center">
                {locale === 'zh' 
                  ? '支持后AI将生成独特的加速弹幕' 
                  : 'AI will generate unique acceleration barrage'}
              </p>
            </div>
            
            {/* 提示文字 */}
            <div className="text-center space-y-2">
              <p className="text-white/80 font-medium">
                {locale === 'zh' ? '微信扫码赞赏支持' : 'Scan with WeChat to support'}
              </p>
              <p className="text-white/50 text-sm">
                {locale === 'zh' 
                  ? '感谢您的支持，让地球转得更快！' 
                  : 'Thank you for your support!'}
              </p>
            </div>

            {/* 装饰元素 */}
            <div className="flex items-center gap-2 text-cyan-400/60">
              <QrCode className="w-4 h-4" />
              <span className="text-xs">
                {locale === 'zh' ? '长按识别二维码' : 'Long press to scan QR code'}
              </span>
            </div>
            

          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(300%); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
