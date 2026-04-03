import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// YungouOS 配置 - 从环境变量获取
const YUNGOUS_APP_ID = process.env.YUNGOUS_APP_ID || '';
const YUNGOUS_APP_SECRET = process.env.YUNGOUS_APP_SECRET || '';
const YUNGOUS_MCH_ID = process.env.YUNGOUS_MCH_ID || '';

// 检查是否配置了支付
function isPaymentConfigured(): boolean {
  return !!(YUNGOUS_APP_ID && YUNGOUS_APP_SECRET && YUNGOUS_MCH_ID);
}

// 生成订单号
function generateOutTradeNo(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `FM${timestamp}${random}`.toUpperCase();
}

// 创建微信支付订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    // 验证金额
    if (!amount || amount < 0.01 || amount > 10000) {
      return NextResponse.json({ 
        error: 'Invalid amount', 
        message: 'Amount must be between 0.01 and 10000' 
      }, { status: 400 });
    }

    // 检查支付配置
    if (!isPaymentConfigured()) {
      return NextResponse.json({ 
        error: 'Payment not configured',
        message: 'Please configure YungouOS credentials in environment variables',
        needsConfig: true
      }, { status: 503 });
    }

    const outTradeNo = generateOutTradeNo();
    const host = request.headers.get('host') || 'faymox.com';
    const notifyUrl = `https://${host}/api/pay/notify`;

    // 创建支付记录
    await db.payment.create({
      data: {
        outTradeNo,
        amount: parseFloat(amount),
        status: 'pending',
      }
    });

    // 调用 YungouOS API 创建支付订单
    const payParams = {
      appid: YUNGOUS_APP_ID,
      mch_id: YUNGOUS_MCH_ID,
      out_trade_no: outTradeNo,
      total_fee: Math.round(amount * 100), // 转换为分
      body: 'Faymox - 让地球转快点',
      notify_url: notifyUrl,
      return_url: `https://${host}`,
      trade_type: 'NATIVE', // 扫码支付
    };

    // 生成签名
    const signStr = Object.keys(payParams)
      .filter(key => payParams[key as keyof typeof payParams])
      .sort()
      .map(key => `${key}=${payParams[key as keyof typeof payParams]}`)
      .join('&') + `&key=${YUNGOUS_APP_SECRET}`;
    
    const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    // 调用 YungouOS API
    const yungouosApiUrl = 'https://api.yungouos.com/api/pay/unifiedorder';
    
    const response = await fetch(yungouosApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payParams, sign }),
    });

    const result = await response.json();

    if (result.return_code === 'SUCCESS' && result.code_url) {
      // 更新支付记录
      await db.payment.update({
        where: { outTradeNo },
        data: { payUrl: result.code_url }
      });

      return NextResponse.json({
        success: true,
        outTradeNo,
        payUrl: result.code_url, // 二维码链接
        qrCode: result.code_url,
      });
    } else {
      // 支付创建失败
      await db.payment.update({
        where: { outTradeNo },
        data: { status: 'failed' }
      });

      return NextResponse.json({ 
        error: 'Failed to create payment',
        message: result.return_msg || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ 
      error: 'Payment failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 查询支付状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outTradeNo = searchParams.get('outTradeNo');

    if (!outTradeNo) {
      return NextResponse.json({ error: 'Missing outTradeNo' }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { outTradeNo }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // 如果支付已成功，返回成功状态
    if (payment.status === 'success') {
      return NextResponse.json({ status: 'success', amount: payment.amount });
    }

    // 检查支付配置
    if (!isPaymentConfigured()) {
      return NextResponse.json({ status: payment.status });
    }

    // 查询 YungouOS 支付状态
    const queryParams = {
      appid: YUNGOUS_APP_ID,
      mch_id: YUNGOUS_MCH_ID,
      out_trade_no: outTradeNo,
    };

    const signStr = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
      .join('&') + `&key=${YUNGOUS_APP_SECRET}`;
    
    const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    const queryUrl = `https://api.yungouos.com/api/pay/query?out_trade_no=${outTradeNo}&appid=${YUNGOUS_APP_ID}&mch_id=${YUNGOUS_MCH_ID}&sign=${sign}`;
    
    const response = await fetch(queryUrl);
    const result = await response.json();

    if (result.trade_state === 'SUCCESS') {
      // 支付成功，更新数据库
      await db.$transaction(async (tx) => {
        await tx.payment.update({
          where: { outTradeNo },
          data: { status: 'success' }
        });

        // 更新总金额
        await tx.globalStats.update({
          where: { id: 'global' },
          data: { totalAmount: { increment: payment.amount } }
        });
      });

      return NextResponse.json({ status: 'success', amount: payment.amount });
    }

    return NextResponse.json({ status: payment.status });
  } catch (error) {
    console.error('Query payment error:', error);
    return NextResponse.json({ error: 'Failed to query payment' }, { status: 500 });
  }
}
