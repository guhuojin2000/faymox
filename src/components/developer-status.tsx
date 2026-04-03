'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';

// 开发者状态消息
const DEVELOPER_MESSAGES = [
  { zh: '寻找灵感中...', en: 'In search of inspiration...' },
  { zh: '思考下一个项目...', en: 'Pondering the next project...' },
  { zh: '正在观察地球旋转...', en: 'Observing Earth rotation...' },
  { zh: '咖啡已空，需要能量...', en: 'Coffee empty, need energy...' },
  { zh: '与量子纠缠中...', en: 'Entangling with quantum...' },
  { zh: '调试宇宙参数...', en: 'Debugging universe parameters...' },
  { zh: '编译梦境中...', en: 'Compiling dreams...' },
  { zh: '等待创意降临...', en: 'Awaiting creativity descent...' },
  { zh: '计算最优转速...', en: 'Calculating optimal spin...' },
  { zh: '探索未知的可能性...', en: 'Exploring unknown possibilities...' },
];

export default function DeveloperStatus() {
  const { locale } = useLocale();
  const [currentMessage, setCurrentMessage] = useState(DEVELOPER_MESSAGES[0]);
  const [isBlinking, setIsBlinking] = useState(false);

  // 定期更换消息
  useEffect(() => {
    const changeMessage = () => {
      const randomMessage = DEVELOPER_MESSAGES[Math.floor(Math.random() * DEVELOPER_MESSAGES.length)];
      setCurrentMessage(randomMessage);
    };

    // 初始消息
    changeMessage();

    // 每 10 秒更换一次
    const interval = setInterval(changeMessage, 10000);

    return () => clearInterval(interval);
  }, []);

  // 宇航员眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const messageText = locale === 'zh' ? currentMessage.zh : currentMessage.en;

  return (
    <div className="fixed top-16 right-4 md:right-8 z-20 max-w-[200px]">
      <div className="relative group">
        {/* 主浮窗 */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-cyan-500/20">
          {/* 宇航员图标 */}
          <div className="flex items-start gap-2">
            <div className="text-2xl leading-none relative">
              🧑‍🚀
              {/* 闪烁效果 */}
              <div className={`absolute inset-0 bg-white/30 rounded-full transition-opacity duration-100 ${isBlinking ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* 开发者标签 */}
              <div className="text-[10px] text-cyan-400/80 font-medium mb-0.5">
                {locale === 'zh' ? '开发者' : 'Developer'}
              </div>
              
              {/* 状态消息 */}
              <div className="text-xs text-white/60 leading-relaxed">
                {messageText}
              </div>
            </div>
          </div>
          
          {/* 底部来源 */}
          <div className="flex items-center justify-end gap-1 mt-2 pt-1.5 border-t border-white/5">
            <span className="text-[9px] text-white/30">
              By Curiosity
            </span>
            <span className="text-[10px] animate-pulse">✨</span>
          </div>
        </div>
        
        {/* 连接线动画 */}
        <div className="absolute -left-8 top-1/2 w-6 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
