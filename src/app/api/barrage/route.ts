import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Barrage types
type BarrageType = 'random' | 'support' | 'milestone';

interface BarrageRequest {
  type: BarrageType;
  amount?: number;
  velocity?: number;
  customMessage?: string;
  locale?: 'zh' | 'en';
}

// Generate barrage content using LLM
async function generateBarrage(params: BarrageRequest) {
  const { type, amount, velocity, customMessage, locale = 'zh' } = params;

  let zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  try {
    zai = await ZAI.create();
  } catch (error) {
    console.error('Failed to initialize ZAI:', error);
    return getFallbackBarrage(type, amount, velocity, locale);
  }

  let systemPrompt = '';
  let userPrompt = '';

  if (type === 'random') {
    // Random geeky/funny barrage
    systemPrompt = `你是一个极客风格的创意文案生成器。生成简短、幽默、符合极客、科学、自嘲或哲学调性的弹幕文字。
要求：
- 中英双语，格式：中文 | 英文
- 中文在前，英文在后，用 | 分隔
- 长度控制在25字以内
- 风格：极客、科学、幽默、自嘲、或哲学
- 主题：让地球转快点、开发者还没想好做什么、宇宙、物理、编程、量子力学
- 要有创意，避免老套`;
    userPrompt = '生成一条独特的极客弹幕，让它有趣且富有想象力';
  } else if (type === 'support') {
    // Support thank you message - 升级版
    if (customMessage) {
      systemPrompt = `你是一个文案润色专家。用户输入了一条支持宣言，请润色这条宣言使其更有力量感和极客风格。
要求：
- 中英双语，格式：中文 | 英文
- 保持原意但增加动感
- 可以适当加入极客元素（如引力单位、能量、量子等词汇）
- 让用户感觉自己的支持被转化为了一种科学/科幻的力量`;
      userPrompt = `润色这条引力宣言："${customMessage}"，金额：${amount}元`;
    } else {
      systemPrompt = `你是一个极客风格的创意文案生成器。一位匿名赞助者刚刚支持了地球加速项目，请生成一条精美、动感、充满活力的致谢或加速宣告语。
要求：
- 中英双语，格式：中文 | 英文
- 中文在前，英文在后，用 | 分隔
- 长度控制在35字以内
- 风格：动感、感激、充满能量、科幻感
- 突出"引力单位(Gravity Units)"和"动力注入"的概念
- 让支持者感到自己的贡献被转化为一种神奇的科学力量
- 示例风格："匿名极客：我的支持已转化为100个引力单位！DeepSeek-tuned momentum! (+100 Gravity Units!)"`;
      userPrompt = `生成精美的支持致谢弹幕，支持金额：${amount}元，当前转速：${velocity}圈/天。要让支持者感到自己的支持被转化为了一种神奇的科学力量！`;
    }
  } else if (type === 'milestone') {
    // Milestone celebration
    systemPrompt = `你是一个极客风格的创意文案生成器。地球转速达到了一个里程碑，请生成一条震撼的庆祝弹幕。
要求：
- 中英双语，格式：中文 | 英文
- 中文在前，英文在后，用 | 分隔
- 长度控制在30字以内
- 风格：震撼、庆祝、科幻、史诗感
- 使用宇宙、量子、光速等宏大元素`;
    userPrompt = `生成里程碑庆祝弹幕，当前转速：${velocity}圈/天`;
  }

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      thinking: { type: 'disabled' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (content) {
      // Parse bilingual content
      const parts = content.split('|').map(s => s.trim());
      return {
        zh: parts[0] || content,
        en: parts[1] || content,
        isPremium: type === 'support' || type === 'milestone',
      };
    }
  } catch (error) {
    console.error('LLM generation failed:', error);
  }

  return getFallbackBarrage(type, amount, velocity, locale);
}

// Fallback barrages when LLM fails - 升级版
function getFallbackBarrage(type: BarrageType, amount?: number, velocity?: number, _locale?: 'zh' | 'en') {
  const randomBarrages = [
    { zh: '编译时间缩短，转速加一', en: 'Compile time reduced, rotation +1' },
    { zh: '我在地球赤道拉了个响指', en: 'Snapped my fingers at the equator' },
    { zh: '模型推荐：稍微快一点', en: 'Model recommends slightly more velocity' },
    { zh: '调试中...转速优化中...', en: 'Debugging... optimizing rotation...' },
    { zh: '这行代码让世界转起来', en: 'This code makes the world spin' },
    { zh: '宇宙不在乎你转多快', en: "The universe doesn't care how fast you spin" },
    { zh: '物理定律说：可以更快', en: 'Physics says: can go faster' },
    { zh: '熵增？不，我们减熵', en: 'Entropy? No, we reduce it' },
    { zh: '光速太慢，地球先转', en: 'Light is slow, let Earth spin first' },
    { zh: '我的GPU在为地球加速', en: 'My GPU is accelerating Earth' },
    { zh: '量子叠加状态已确定，速度 +1', en: 'Quantum superposition finalized, speed +1' },
    { zh: '我们在宇宙边缘扔了个响指', en: 'We snapped at the edge of the universe' },
    { zh: 'AI 正在推荐更激进的旋转', en: 'AI is recommending a slightly more aggressive spin' },
  ];

  const supportBarrages = [
    { zh: '✨ 匿名极客：我的支持已转化为引力单位！', en: '✨ Anonymous Geek: Support converted to Gravity Units!' },
    { zh: '🌟 一位探索者注入了能量，地球转速提升！', en: '🌟 An explorer injected energy, Earth velocity increased!' },
    { zh: '💫 感谢支持！开发者获得了新的灵感火花', en: '💫 Thanks for support! Dev got a new spark of inspiration' },
    { zh: '⚡ 能量已转化为地球动力，引力场增强！', en: '⚡ Energy converted to Earth momentum, gravity field enhanced!' },
    { zh: '🚀 一位星际旅行者留下了加速印记...', en: '🚀 An interstellar traveler left an acceleration mark...' },
  ];

  const milestoneBarrages = [
    { zh: '🎉 新里程碑达成！地球正在超越自我！', en: '🎉 New milestone achieved! Earth is transcending itself!' },
    { zh: '🌟 突破极限！宇宙感受到了我们的能量！', en: '🌟 Breaking limits! The universe senses our energy!' },
    { zh: '⚡ 里程碑！转速突破新高度！', en: '⚡ Milestone! Rotation reached new heights!' },
  ];

  let barrage;
  if (type === 'support') {
    barrage = supportBarrages[Math.floor(Math.random() * supportBarrages.length)];
    if (amount && amount >= 50) {
      barrage = { 
        zh: `🌟 超级支持者注入了 ${amount} 引力单位！地球感受到强大的能量波动！`, 
        en: `🌟 Super supporter injected ${amount} Gravity Units! Earth senses powerful energy waves!` 
      };
    } else if (amount && amount >= 20) {
      barrage = {
        zh: `✨ 一位慷慨的支持者注入了 ${amount} 能量单位！`,
        en: `✨ A generous supporter injected ${amount} energy units!`
      };
    }
  } else if (type === 'milestone') {
    barrage = milestoneBarrages[Math.floor(Math.random() * milestoneBarrages.length)];
    if (velocity) {
      barrage = {
        zh: `🎉 转速突破 ${velocity.toFixed(1)} 圈/天！地球正在加速进化！`,
        en: `🎉 Rotation exceeded ${velocity.toFixed(1)} rotations/day! Earth is accelerating evolution!`
      };
    }
  } else {
    barrage = randomBarrages[Math.floor(Math.random() * randomBarrages.length)];
  }

  return {
    ...barrage,
    isPremium: type === 'support' || type === 'milestone',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BarrageRequest;
    const barrage = await generateBarrage(body);
    
    return NextResponse.json({
      success: true,
      barrage,
    });
  } catch (error) {
    console.error('Barrage API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate barrage',
    }, { status: 500 });
  }
}

// Get random barrages (for initial load / cache)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'random') as BarrageType;
  
  // 返回多个弹幕用于缓存
  const barrages = [];
  for (let i = 0; i < 5; i++) {
    barrages.push(getFallbackBarrage(type, undefined, undefined, 'zh'));
  }
  
  return NextResponse.json({
    success: true,
    barrages,
  });
}
