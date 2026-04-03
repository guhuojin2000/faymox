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

function EnergyParticles({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-energy-particle"
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

  const handleButtonClick = useCallback(() => {
    setShowParticles(true);
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
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
      <EnergyParticles active={showParticles} />
      
      <div className="flex flex-col items-center gap-2 md:gap-4 w-full max-w-xs md:max-w-sm px-2">
        <div className="text-center mb-1 md:mb-2">
          <h2 className="text-sm md:text-xl font-bold text-white/80 tracking-wider">
            {locale === 'zh' ? '项目代号：地球加速' : 'Project Earth Accelerator'}
          </h2>
        </div>

        <div className="flex items-baseline gap-1.5 md:gap-2">
          <span className="font-mono text-3xl md:text-5xl font-bold text-white tabular-nums">
            {currentVelocity.toFixed(2)}
          </span>
          <span className="text-white/50 text-xs md:text-base">
            {t.rotationsPerDay}
          </span>
        </div>

        <div className="w-full h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentVelocity / 2000) * 100, 100)}%` }}
          />
        </div>

        <Button
          onClick={handleButtonClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`
            w-full py-4 md:py-6 text-base md:text-lg font-semibold 
            bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 
            hover:from-pink-400 hover:via-rose-400 hover:to-orange-300
            text-white shadow-lg shadow-pink-500/30 
            transition-all duration-300
            ${isHovering ? 'scale-[1.02] shadow-pink-500/50' : ''}
            ${showParticles ? 'scale-95 opacity-80' : ''}
            relative overflow-hidden group
            touch-manipulation
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          <div className="flex flex-col items-center gap-0.5 md:gap-1 relative z-10">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isHovering ? 'animate-pulse' : ''}`} />
              <span>{t.supportDeveloper}</span>
              <Rocket className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${isHovering ? 'translate-x-1 -translate-y-0.5' : ''}`} />
            </div>
            <span className="text-[10px] md:text-xs opacity-80 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {locale === 'zh' ? '(并加速地球)' : '(+ Earth Velocity)'}
            </span>
          </div>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-md border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-lg md:text-xl flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              {t.supportDeveloper}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-4 md:py-6 space-y-3 md:space-y-4">
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-2xl relative">
              <img 
                src="/reward-qr.png"
                alt={locale === 'zh' ? '微信赞赏码' : 'WeChat Reward QR Code'}
                className="w-48 h-48 md:w-56 md:h-56 object-contain"
              />
              <div className="absolute inset-3 md:inset-4 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 to-transparent h-1/3 animate-scan" />
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <Input
                type="text"
                placeholder={locale === 'zh' 
                  ? '留下你的引力宣言（可选）' 
                  : 'Your gravity declaration (optional)'}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-slate-800 border-slate-600 focus:border-pink-500 text-white placeholder:text-white/30 text-sm md:text-base"
                maxLength={50}
              />
              <p className="text-[10px] md:text-xs text-white/40 text-center">
                {locale === 'zh' 
                  ? '支持后AI将生成独特的加速弹幕' 
                  : 'AI will generate unique acceleration barrage'}
              </p>
            </div>
            
            <div className="text-center space-y-1 md:space-y-2">
              <p className="text-white/80 font-medium text-sm md:text-base">
                {locale === 'zh' ? '微信扫码赞赏支持' : 'Scan with WeChat to support'}
              </p>
              <p className="text-white/50 text-xs md:text-sm">
                {locale === 'zh' 
                  ? '感谢您的支持，让地球转得更快！' 
                  : 'Thank you for your support!'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 text-cyan-400/60">
              <QrCode className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-[10px] md:text-xs">
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
