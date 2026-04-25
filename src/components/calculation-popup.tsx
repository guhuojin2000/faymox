'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocale } from '@/lib/locale-context';
import { MissileType } from './missile-launch-pad';
import { X, Cpu, Zap } from 'lucide-react';

interface CalculationPopupProps {
  missile: MissileType | null;
  boost: number;
  onClose: () => void;
}

interface CalculationStep {
  text: string;
  textEn: string;
  delay: number;
  type: 'formula' | 'text' | 'result';
}

export default function CalculationPopup({ missile, boost, onClose }: CalculationPopupProps) {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [steps, setSteps] = useState<CalculationStep[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const prevMissileRef = useRef<MissileType | null>(null);

  useEffect(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    if (missile && missile !== prevMissileRef.current) {
      const mass = Math.floor(100 + Math.random() * 900);
      const velocity = Math.floor(20000 + Math.random() * 10000);
      
      const newSteps: CalculationStep[] = [
        {
          text: `检测到质量 M = ${mass}kg`,
          textEn: `Detected mass M = ${mass}kg`,
          delay: 500,
          type: 'text',
        },
        {
          text: `相对速度 V = ${velocity.toLocaleString()} km/h`,
          textEn: `Relative velocity V = ${velocity.toLocaleString()} km/h`,
          delay: 800,
          type: 'text',
        },
        {
          text: `正在同步全球时钟...`,
          textEn: `Synchronizing global clocks...`,
          delay: 600,
          type: 'text',
        },
        {
          text: `根据动量守恒公式 ΔL = r × (mΔv)`,
          textEn: `According to momentum conservation: ΔL = r × (mΔv)`,
          delay: 1000,
          type: 'formula',
        },
        {
          text: `Earth_New_Spin = Current_Spin + (${missile.boost} × DeepSeek_Inspiration_Factor)`,
          textEn: `Earth_New_Spin = Current_Spin + (${missile.boost} × DeepSeek_Inspiration_Factor)`,
          delay: 1200,
          type: 'formula',
        },
        {
          text: `Gravity_Boost = exp(Energy_Input) / Planet_Inertia_Constant`,
          textEn: `Gravity_Boost = exp(Energy_Input) / Planet_Inertia_Constant`,
          delay: 1000,
          type: 'formula',
        },
        {
          text: `正在抵消月球潮汐锁定效应...`,
          textEn: `Canceling lunar tidal locking effect...`,
          delay: 800,
          type: 'text',
        },
        {
          text: `动力注入成功！`,
          textEn: `Power injection successful!`,
          delay: 600,
          type: 'text',
        },
        {
          text: `计算结果：全球自转速度提升 +${boost.toFixed(4)} 圈/天`,
          textEn: `Result: Global rotation speed increased by +${boost.toFixed(4)} rotations/day`,
          delay: 1000,
          type: 'result',
        },
      ];

      setSteps(newSteps);
      setVisible(true);
      setCurrentStep(0);
      setShowResult(false);
      prevMissileRef.current = missile;

      let totalDelay = 0;
      newSteps.forEach((step, index) => {
        totalDelay += step.delay;
        const timer = setTimeout(() => {
          setCurrentStep(index + 1);
          if (index === newSteps.length - 1) {
            setShowResult(true);
          }
        }, totalDelay);
        timersRef.current.push(timer);
      });
    } else if (!missile) {
      setVisible(false);
      setCurrentStep(0);
      setShowResult(false);
      setSteps([]);
      prevMissileRef.current = null;
    }

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [missile, boost]);

  const handleClose = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setVisible(false);
    onClose();
  };

  if (!visible || !missile) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900/95 border rounded-2xl shadow-2xl overflow-hidden"
        style={{ 
          borderColor: `${missile.color}50`,
          boxShadow: `0 0 40px ${missile.color}30, 0 0 80px ${missile.color}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `linear-gradient(135deg, ${missile.color}20 0%, transparent 50%, ${missile.color}10 100%)`,
          }}
        />

        <div className="relative flex items-center justify-between p-3 md:p-4 border-b border-white/10">
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${missile.color}30` }}
            >
              <Cpu className="w-4 h-4 md:w-5 md:h-5" style={{ color: missile.color }} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm md:text-base">
                {locale === 'zh' ? '物理计算演练' : 'Physics Calculation'}
              </h3>
              <p className="text-[10px] md:text-xs text-white/50">
                {locale === 'zh' ? missile.name : missile.nameEn} 冲击分析
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 md:w-4 md:h-4 text-white/70" />
          </button>
        </div>

        <div className="relative p-3 md:p-4 space-y-2 md:space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-cyan-400/60 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{locale === 'zh' ? '实时计算中...' : 'Calculating in real-time...'}</span>
          </div>

          {steps.slice(0, currentStep).map((step, index) => (
            <div
              key={index}
              className={`
                p-2 md:p-3 rounded-lg transition-all duration-300
                ${step.type === 'formula' 
                  ? 'bg-slate-800/50 border border-cyan-500/20 font-mono text-[10px] md:text-xs' 
                  : step.type === 'result'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30'
                    : 'bg-slate-800/30'}
              `}
            >
              <div className="flex items-start gap-2">
                {step.type === 'formula' && (
                  <span className="text-cyan-400 text-[10px] md:text-xs">{'>'}</span>
                )}
                {step.type === 'result' && (
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                )}
                <span 
                  className={`
                    ${step.type === 'formula' ? 'text-cyan-300' : ''}
                    ${step.type === 'result' ? 'text-cyan-300 font-bold text-xs md:text-sm' : 'text-white/80 text-[10px] md:text-xs'}
                    ${step.type === 'text' ? 'text-white/70' : ''}
                  `}
                >
                  {locale === 'zh' ? step.text : step.textEn}
                </span>
              </div>
            </div>
          ))}

          {currentStep < steps.length && (
            <div className="flex items-center gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>

        {showResult && (
          <div className="relative p-3 md:p-4 border-t border-white/10 bg-black/20">
            <button
              onClick={handleClose}
              className="w-full py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${missile.color}40, ${missile.color}20)`,
                border: `1px solid ${missile.color}50`,
                color: missile.color,
              }}
            >
              {locale === 'zh' ? '确认加速' : 'Confirm Boost'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
