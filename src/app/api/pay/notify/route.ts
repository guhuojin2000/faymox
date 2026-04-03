import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const YUNGOUS_APP_SECRET = process.env.YUNGOUS_APP_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const outTradeNo = params.get('out_trade_no');
    const transactionId = params.get('transaction_id');
    const totalFee = params.get('total_fee');
    const sign = params.get('sign');

    // 验证签名
    const signParams: { [key: string]: string } = {};
    params.forEach((value, key) => {
      if (key !== 'sign' && value) {
        signParams[key] = value;
      }
    });

    const signStr = Object.keys(signParams)
      .sort()
      .map(key => `${key}=${signParams[key]}`)
      .join('&') + `&key=${YUNGOUS_APP_SECRET}`;
    
    const expectedSign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    if (sign !== expectedSign) {
      return new NextResponse('FAIL', { status: 400 });
    }

    // 查找支付记录
    const payment = await db.payment.findUnique({
      where: { outTradeNo: outTradeNo || '' }
    });

    if (!payment) {
      return new NextResponse('FAIL', { status: 404 });
    }

    // 已处理过
    if (payment.status === 'success') {
      return new NextResponse('SUCCESS');
    }

    // 更新支付状态
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { outTradeNo: outTradeNo || '' },
        data: { 
          status: 'success',
          updatedAt: new Date()
        }
      });

      // 更新总金额
      await tx.globalStats.update({
        where: { id: 'global' },
        data: { 
          totalAmount: { increment: payment.amount }
        }
      });
    });

    return new NextResponse('SUCCESS');
  } catch (error) {
    console.error('Notify error:', error);
    return new NextResponse('FAIL', { status: 500 });
  }
}
