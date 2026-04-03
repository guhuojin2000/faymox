'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PaymentDialogProps {
  currentVelocity: number;
  onPaymentSuccess: (amount: number) => void;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export default function PaymentDialog({ currentVelocity, onPaymentSuccess }: PaymentDialogProps) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'pending' | 'success' | 'failed' | 'not_configured'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [outTradeNo, setOutTradeNo] = useState('');
  const [needsConfig, setNeedsConfig] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handlePay = async () => {
    if (finalAmount < 0.01) return;
    
    setStatus('loading');

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const data = await response.json();

      if (data.needsConfig) {
        setNeedsConfig(true);
        setStatus('not_configured');
        return;
      }

      if (data.success) {
        setQrCode(data.qrCode);
        setOutTradeNo(data.outTradeNo);
        setStatus('pending');
        
        // 开始轮询支付状态
        pollPaymentStatus(data.outTradeNo);
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  const pollPaymentStatus = async (tradeNo: string) => {
    const maxAttempts = 120; // 最多轮询2分钟
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('failed');
        return;
      }

      attempts++;

      try {
        const response = await fetch(`/api/pay?outTradeNo=${tradeNo}`);
        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          onPaymentSuccess(data.amount);
          setTimeout(() => {
            setOpen(false);
            resetState();
          }, 2000);
          return;
        }

        // 继续轮询
        setTimeout(poll, 1000);
      } catch {
        setTimeout(poll, 1000);
      }
    };

    poll();
  };

  const resetState = () => {
    setStatus('idle');
    setQrCode('');
    setOutTradeNo('');
    setCustomAmount('');
    setAmount(5);
    setNeedsConfig(false);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25"
      >
        <Heart className="w-4 h-4 mr-2" />
        {t.supportDeveloper}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {t.supportDeveloper}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              {locale === 'zh' 
                ? `当前转速: ${currentVelocity.toFixed(2)} 圈/天`
                : `Current speed: ${currentVelocity.toFixed(2)} rotations/day`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {status === 'idle' && (
              <>
                {/* 预设金额 */}
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = amount === amt && !customAmount;
                    return (
                      <button
                        key={amt}
                        onClick={() => {
                          setAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`
                          py-2 px-3 rounded-md font-medium text-sm transition-all
                          ${isSelected 
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                            : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'}
                        `}
                      >
                        ¥{amt}
                      </button>
                    );
                  })}
                </div>

                {/* 自定义金额 */}
                <div className="space-y-2">
                  <Label className="text-slate-400">{t.chooseAmount}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                    <Input
                      type="number"
                      placeholder="自定义金额"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8 bg-slate-800 border-slate-600 focus:border-amber-500"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* 支付按钮 */}
                <Button
                  onClick={handlePay}
                  disabled={finalAmount < 0.01}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {t.wechatPay} - ¥{finalAmount.toFixed(2)}
                </Button>
              </>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                <p className="mt-4 text-slate-400">{t.loading}</p>
              </div>
            )}

            {status === 'not_configured' && (
              <div className="flex flex-col items-center py-8">
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="mt-4 text-center text-slate-400">
                  {locale === 'zh' 
                    ? '支付功能暂未配置，请联系开发者' 
                    : 'Payment is not configured yet. Please contact the developer.'}
                </p>
              </div>
            )}

            {status === 'pending' && qrCode && (
              <div className="flex flex-col items-center py-4">
                <div className="bg-white p-3 rounded-lg">
                  {/* QR Code 图片 */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="WeChat Pay QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="mt-4 text-center text-slate-400">
                  {locale === 'zh' ? '请使用微信扫码支付' : 'Scan with WeChat to pay'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {t.paymentPending}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="mt-4 text-green-400">{t.paymentSuccess}</p>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex flex-col items-center py-8">
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="mt-4 text-red-400">{t.paymentFailed}</p>
                <Button
                  onClick={resetState}
                  variant="outline"
                  className="mt-4 border-slate-600"
                >
                  {locale === 'zh' ? '重试' : 'Try Again'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
