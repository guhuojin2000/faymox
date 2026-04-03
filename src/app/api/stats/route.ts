import { NextResponse } from 'next/server';

// 内存存储
let globalStats = {
  totalAmount: 0,
  baseSpeed: 1,
};

export async function GET() {
  try {
    const velocity = globalStats.baseSpeed + globalStats.totalAmount / 10000;
    const isOverThousand = velocity >= 1000;

    return NextResponse.json({
      velocity: parseFloat(velocity.toFixed(2)),
      totalAmount: globalStats.totalAmount,
      isOverThousand,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      velocity: 1,
      totalAmount: 0,
      isOverThousand: false,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (typeof amount === 'number' && amount > 0) {
      globalStats.totalAmount += amount;
    }

    const velocity = globalStats.baseSpeed + globalStats.totalAmount / 10000;
    const isOverThousand = velocity >= 1000;

    return NextResponse.json({
      success: true,
      velocity: parseFloat(velocity.toFixed(2)),
      totalAmount: globalStats.totalAmount,
      isOverThousand,
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json({
      success: false,
      velocity: 1,
      totalAmount: 0,
      isOverThousand: false,
    });
  }
}