'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from '@/lib/locale-context';
import { Sparkles, X, Volume2, VolumeX, RefreshCw } from 'lucide-react';

type MessageType = 'random' | 'speed_warning' | 'big_sponsor' | 'milestone' | 'pseudoscience' | 'welcome';

interface ScientistMessage {
  text: string;
  type: MessageType;
  timestamp: number;
}

interface ChiefScientistProps {
  velocity?: number;
  lastAmount?: number;
}

const ONE_HOUR = 60 * 60 * 1000;

export default function ChiefScientist({ velocity = 1, lastAmount = 0 }: ChiefScientistProps) {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ScientistMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<ScientistMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevVelocityRef = useRef(velocity);
  const prevAmountRef = useRef(lastAmount);
  const messageQueueRef = useRef<MessageType[]>([]);
  const hasWelcomedRef = useRef(false);
  const lastBroadcastRef = useRef<number>(0);

  const fetchMessage = useCallback(async (type: MessageType) => {
    setIsLoading(true);
    try {
      const url = `/api/scientist?type=${type}&velocity=${velocity}&amount=${lastAmount}&locale=${locale}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.message) {
        const text = locale === 'zh' ? data.message.zh : data.message.en;
        const newMessage: ScientistMessage = {
          text,
          type,
          timestamp: Date.now(),
        };
        setCurrentMessage(newMessage);
        setMessages(prev => [...prev.slice(-9), newMessage]);
        lastBroadcastRef.current = Date.now();
        return text;
      }
    } catch (error) {
      console.error('Failed to fetch scientist message:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [velocity, lastAmount, locale]);

  const playSound = useCallback((type: MessageType) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      switch (type) {
        case 'big_sponsor':
          osc.frequency.setValueAtTime(600, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
          osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          break;
        case 'milestone':
          osc.frequency.setValueAtTime(400, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
          osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.4);
          gain.gain.setValueAtTime(0.12, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          break;
        default:
          osc.frequency.setValueAtTime(300, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
          gain.gain.setValueAtTime(0.08, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      }
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.6);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  const processQueue = useCallback(async () => {
    if (messageQueueRef.current.length === 0) return;
    
    const type = messageQueueRef.current.shift()!;
    const text = await fetchMessage(type);
    if (text) {
      playSound(type);
    }
    
    if (messageQueueRef.current.length > 0) {
      setTimeout(processQueue, 2000);
    }
  }, [fetchMessage, playSound]);

  const queueMessage = useCallback((type: MessageType) => {
    messageQueueRef.current.push(type);
    if (messageQueueRef.current.length === 1) {
      processQueue();
    }
  }, [processQueue]);

  useEffect(() => {
    if (lastAmount > prevAmountRef.current && lastAmount > 0) {
      if (lastAmount >= 50) {
        queueMessage('big_sponsor');
      } else if (lastAmount >= 20) {
        queueMessage('milestone');
      }
    }
    prevAmountRef.current = lastAmount;
  }, [lastAmount, queueMessage]);

  useEffect(() => {
    const velocityRatio = velocity / prevVelocityRef.current;
    if (velocityRatio > 1.5 && velocity > 50) {
      queueMessage('speed_warning');
    }
    prevVelocityRef.current = velocity;
  }, [velocity, queueMessage]);

  useEffect(() => {
    if (hasWelcomedRef.current) return;
    hasWelcomedRef.current = true;
    
    const welcomeTimeout = setTimeout(() => {
      queueMessage('welcome');
    }, 3000);
    return () => clearTimeout(welcomeTimeout);
  }, [queueMessage]);

  useEffect(() => {
    const randomInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastBroadcastRef.current >= ONE_HOUR) {
        const types: MessageType[] = ['random', 'pseudoscience'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        queueMessage(randomType);
      }
    }, ONE_HOUR);
    return () => clearInterval(randomInterval);
  }, [queueMessage]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    queueMessage('random');
  }, [queueMessage]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-4 z-30">
          <button
            onClick={handleOpen}
            className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center animate-bounce-subtle hover:scale-110 transition-transform"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75" />
            {currentMessage && (
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`
              relative w-full max-w-lg bg-slate-900/95 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20
              transition-all duration-300 overflow-hidden max-h-[90vh] md:max-h-none
              ${isExpanded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
            `}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-16 md:w-20 h-16 md:h-20 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative flex items-center justify-between p-3 md:p-4 border-b border-white/10">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">
                    {locale === 'zh' ? '首席科学家' : 'Chief Scientist'}
                  </h3>
                  <p className="text-[10px] md:text-xs text-purple-400">
                    {locale === 'zh' ? 'Faymox 地球动力实验室' : 'Faymox Earth Dynamics Lab'}
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

            <div className="relative p-3 md:p-4 space-y-3 md:space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500/30 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs md:text-sm">🧑‍🔬</span>
                </div>
                <div className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-white/50">
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span className="text-xs md:text-sm">{locale === 'zh' ? '思考中...' : 'Thinking...'}</span>
                    </div>
                  ) : (
                    <p className="text-white/90 text-xs md:text-sm leading-relaxed">
                      {currentMessage?.text || (locale === 'zh' ? '你好！我是首席科学家，随时为您播报地球加速的最新动态！' : 'Hello! I\'m the Chief Scientist, ready to report the latest Earth acceleration updates!')}
                    </p>
                  )}
                </div>
              </div>

              {messages.length > 1 && (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <p className="text-[10px] md:text-xs text-white/30 mb-2">
                    {locale === 'zh' ? '历史播报' : 'Previous broadcasts'}
                  </p>
                  {messages.slice(0, -1).reverse().slice(0, 5).map((msg) => (
                    <div key={msg.timestamp} className="flex items-start gap-2 opacity-50">
                      <span className="text-[10px] mt-1">•</span>
                      <p className="text-[10px] md:text-xs text-white/60">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-between p-2 md:p-3 border-t border-white/10 bg-black/20">
              <button
                onClick={handleToggleSound}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                ) : (
                  <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-white/50" />
                )}
                <span className="text-[10px] md:text-xs text-white/70">
                  {soundEnabled ? (locale === 'zh' ? '音效' : 'Sound') : (locale === 'zh' ? '静音' : 'Muted')}
                </span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-purple-500/30 hover:bg-purple-500/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 text-purple-300 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-[10px] md:text-xs text-purple-300">
                  {locale === 'zh' ? '刷新' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentMessage && !isOpen && (
        <div className="fixed bottom-28 md:bottom-32 right-4 z-20 max-w-[200px] md:max-w-[250px]">
          <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg shadow-purple-500/10 animate-slide-in-up">
            <div className="flex items-start gap-1 md:gap-2">
              <span className="text-base md:text-lg">🧑‍🔬</span>
              <p className="text-[10px] md:text-xs text-white/80 leading-relaxed line-clamp-3">
                {currentMessage.text}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
