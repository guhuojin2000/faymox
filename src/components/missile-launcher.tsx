'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MissileType } from './missile-launch-pad';

interface MissileLauncherProps {
  missile: MissileType | null;
  onComplete: (missile: MissileType) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function MissileLauncher({ missile, onComplete }: MissileLauncherProps) {
  const [missilePos, setMissilePos] = useState({ x: 0, y: 0, progress: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [earthShake, setEarthShake] = useState(false);
  const particleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const createParticles = useCallback((x: number, y: number, color: string, effect: string, count: number = 20) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = effect === 'darkmatter' ? 2 + Math.random() * 3 : 3 + Math.random() * 5;
      const size = effect === 'matrix' ? 2 + Math.random() * 3 : 3 + Math.random() * 4;
      
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        color,
        size,
      });
    }
    return newParticles;
  }, []);

  useEffect(() => {
    if (!missile) {
      setMissilePos({ x: 0, y: 0, progress: 0 });
      setParticles([]);
      setShowExplosion(false);
      setEarthShake(false);
      return;
    }

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight + 50;
    const endX = window.innerWidth / 2;
    const endY = window.innerHeight / 2 - 50;

    let progress = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentX = startX + (endX - startX) * easeProgress;
      const currentY = startY + (endY - startY) * easeProgress;

      setMissilePos({ x: currentX, y: currentY, progress });

      if (progress < 1) {
        if (progress > 0.1) {
          const trailParticles = createParticles(
            currentX + (Math.random() - 0.5) * 20,
            currentY + 20,
            missile.color,
            missile.effect,
            3
          );
          setParticles(prev => [...prev.slice(-50), ...trailParticles]);
        }
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setShowExplosion(true);
        setEarthShake(true);
        
        const explosionParticles = createParticles(
          endX,
          endY,
          missile.color,
          missile.effect,
          50
        );
        setParticles(prev => [...prev.slice(-30), ...explosionParticles]);

        setTimeout(() => {
          setEarthShake(false);
          onComplete(missile);
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [missile, createParticles, onComplete]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (!missile) return null;

  return (
    <>
      {earthShake && (
        <style jsx global>{`
          @keyframes earth-shake {
            0%, 100% { transform: translateX(0) translateY(0); }
            10% { transform: translateX(-5px) translateY(-3px); }
            20% { transform: translateX(5px) translateY(3px); }
            30% { transform: translateX(-4px) translateY(-2px); }
            40% { transform: translateX(4px) translateY(2px); }
            50% { transform: translateX(-3px) translateY(-1px); }
            60% { transform: translateX(3px) translateY(1px); }
            70% { transform: translateX(-2px) translateY(0); }
            80% { transform: translateX(2px) translateY(0); }
            90% { transform: translateX(-1px) translateY(0); }
          }
          .earth-shake {
            animation: earth-shake 0.5s ease-in-out;
          }
        `}</style>
      )}

      <div className={`fixed inset-0 pointer-events-none z-40 ${earthShake ? 'earth-shake' : ''}`}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {!showExplosion && missilePos.progress > 0 && missilePos.progress < 1 && (
          <div
            className="absolute transition-transform"
            style={{
              left: missilePos.x,
              top: missilePos.y,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
            }}
          >
            <div
              className="w-8 h-8 md:w-10 md:h-10"
              style={{
                color: missile.color,
                filter: `drop-shadow(0 0 10px ${missile.color}) drop-shadow(0 0 20px ${missile.color})`,
              }}
            >
              {missile.icon}
            </div>
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-8 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${missile.color}, transparent)`,
                filter: `blur(2px)`,
              }}
            />
          </div>
        )}

        {showExplosion && (
          <div
            className="absolute"
            style={{
              left: '50%',
              top: 'calc(50% - 50px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="w-32 h-32 md:w-48 md:h-48 rounded-full animate-explosion"
              style={{
                background: `radial-gradient(circle, ${missile.color} 0%, ${missile.color}80 30%, transparent 70%)`,
                filter: `blur(10px)`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes explosion {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .animate-explosion {
          animation: explosion 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
}
