import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 获取当前转速
export async function GET() {
  try {
    // 获取或创建全局统计
    let stats = await db.globalStats.findUnique({
      where: { id: 'global' }
    });

    if (!stats) {
      stats = await db.globalStats.create({
        data: {
          id: 'global',
          totalAmount: 0,
          baseSpeed: 1,
        }
      });
    }

    // 计算转速：基础转速 + 总金额 / 10000
    const velocity = stats.baseSpeed + stats.totalAmount / 10000;
    const isOverThousand = velocity >= 1000;

    return NextResponse.json({
      velocity: parseFloat(velocity.toFixed(2)),
      totalAmount: stats.totalAmount,
      isOverThousand,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
