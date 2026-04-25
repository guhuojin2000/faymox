'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import { Rocket, Zap, Atom, Sparkles, Brain } from 'lucide-react';

export interface MissileType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  boost: number;
  color: string;
  icon: React.ReactNode;
  effect: string;
}

export const MISSILE_TYPES: MissileType[] = [
  {
    id: 'kinetic-arrow',
    name: '动力箭',
    nameEn: 'Kinetic Arrow',
    description: '基础加速',
    descriptionEn: 'Basic acceleration',
    boost: 0.01,
    color: '#ff6b6b',
    icon: <Rocket className="w-5 h-5" />,
    effect: 'fire',
  },
  {
    id: 'nuclear-pulse',
    name: '核脉冲',
    nameEn: 'Nuclear Pulse',
    description: '中量加速，带火光效果',
    descriptionEn: 'Medium boost with fire effect',
    boost: 0.05,
    color: '#ffa500',
    icon: <Zap className="w-5 h-5" />,
    effect: 'nuclear',
  },
  {
    id: 'ion-thruster',
    name: '离子推力器',
    nameEn: 'Ion Thruster',
    description: '持续小幅加速，蓝色尾焰',
    descriptionEn: 'Continuous boost with blue flame',
    boost: 0.02,
    color: '#00bfff',
    icon: <Atom className="w-5 h-5" />,
    effect: 'ion',
  },
  {
    id: 'dark-matter',
    name: '暗物质弹',
    nameEn: 'Dark Matter',
    description: '大幅加速，黑洞坍缩效果',
    descriptionEn: 'Major boost with black hole effect',
    boost: 0.1,
    color: '#9932cc',
    icon: <Sparkles className="w-5 h-5" />,
    effect: 'darkmatter',
  },
  {
    id: 'ai-logic-bomb',
    name: 'AI 逻辑风暴',
    nameEn: 'AI Logic Bomb',
    description: '随机加速，数字矩阵特效',
    descriptionEn: 'Random boost with matrix effect',
    boost: 0.03,
    color: '#00ff88',
    icon: <Brain className="w-5 h-5" />,
    effect: 'matrix',
  },
];

interface MissileLaunchPadProps {
  onLaunch: (missile: MissileType) => void;
  disabled?: boolean;
}

export default function MissileLaunchPad({ onLaunch, disabled }: MissileLaunchPadProps) {
  const { locale } = useLocale();
  const [selectedMissile, setSelectedMissile] = useState<MissileType | null>(null);
  const [hoveredMissile, setHoveredMissile] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMissileClick = useCallback((missile: MissileType) => {
    if (disabled) return;
    setSelectedMissile(missile);
    onLaunch(missile);
    setTimeout(() => setSelectedMissile(null), 1000);
  }, [disabled, onLaunch]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-2 md:mb-3">
        <h3 className="text-xs md:text-sm font-bold text-white/60 tracking-widest uppercase">
          {locale === 'zh' ? '动能补给站' : 'Missile Launch Pad'}
        </h3>
      </div>
      
      <div className="flex items-center justify-center gap-1.5 md:gap-3 px-2">
        {MISSILE_TYPES.map((missile) => {
          const isSelected = selectedMissile?.id === missile.id;
          const isHovered = hoveredMissile === missile.id;
          
          return (
            <button
              key={missile.id}
              onClick={() => handleMissileClick(missile)}
              onMouseEnter={() => setHoveredMissile(missile.id)}
              onMouseLeave={() => setHoveredMissile(null)}
              disabled={disabled || isSelected}
              className={`
                relative group flex flex-col items-center justify-center
                w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl
                bg-slate-900/80 backdrop-blur-md border
                transition-all duration-300
                ${disabled || isSelected 
                  ? 'opacity-50 cursor-not-allowed border-slate-700' 
                  : 'cursor-pointer hover:scale-110 active:scale-95'}
                ${isHovered ? 'border-opacity-100 shadow-lg' : 'border-opacity-50'}
                ${isSelected ? 'animate-pulse scale-90' : ''}
              `}
              style={{
                borderColor: isHovered || isSelected ? missile.color : 'rgba(255,255,255,0.1)',
                boxShadow: isHovered || isSelected 
                  ? `0 0 20px ${missile.color}40, inset 0 0 20px ${missile.color}20` 
                  : 'none',
              }}
            >
              <div 
                className="transition-all duration-300"
                style={{ 
                  color: isHovered || isSelected ? missile.color : 'rgba(255,255,255,0.5)',
                  filter: isHovered || isSelected 
                    ? `drop-shadow(0 0 8px ${missile.color})` 
                    : 'none',
                  transform: isHovered ? 'scale(110%)' : 'scale(100%)',
                }}
              >
                {missile.icon}
              </div>
              
              {!isMobile && isHovered && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                  <div 
                    className="bg-slate-900/95 backdrop-blur-md border rounded-lg p-2 min-w-[140px] shadow-xl"
                    style={{ borderColor: `${missile.color}50` }}
                  >
                    <p className="text-xs font-bold text-white mb-0.5" style={{ color: missile.color }}>
                      {locale === 'zh' ? missile.name : missile.nameEn}
                    </p>
                    <p className="text-[10px] text-white/60">
                      {locale === 'zh' ? missile.description : missile.descriptionEn}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      +{missile.boost.toFixed(2)} {locale === 'zh' ? '圈/天' : 'rotations/day'}
                    </p>
                  </div>
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRight: `1px solid ${missile.color}50`, borderBottom: `1px solid ${missile.color}50` }}
                  />
                </div>
              )}
              
              {isSelected && (
                <div 
                  className="absolute inset-0 rounded-xl md:rounded-2xl animate-ping"
                  style={{ 
                    background: `radial-gradient(circle, ${missile.color}40 0%, transparent 70%)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {isMobile && hoveredMissile && (
        <div className="mt-2 text-center">
          {(() => {
            const missile = MISSILE_TYPES.find(m => m.id === hoveredMissile);
            if (!missile) return null;
            return (
              <p className="text-[10px] text-white/60">
                <span style={{ color: missile.color }}>{locale === 'zh' ? missile.name : missile.nameEn}</span>
                {' '}-{locale === 'zh' ? missile.description : missile.descriptionEn}
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}
