import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-45e2ae6a57694c76bce99a2dfdde859c';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface ScientistRequest {
  type: 'random' | 'speed_warning' | 'big_sponsor' | 'milestone' | 'pseudoscience' | 'welcome';
  velocity?: number;
  amount?: number;
  locale?: 'zh' | 'en';
}

const FALLBACK_RESPONSES = {
  random: {
    zh: '根据我的计算，地球的角动量正在稳步增加。有趣，非常有趣。',
    en: 'According to my calculations, Earth\'s angular momentum is steadily increasing. Fascinating.',
  },
  speed_warning: {
    zh: '按照这个速度，明天所有人都要被甩进太空了...但我喜欢这个主意！',
    en: 'At this rate, everyone will be flung into space tomorrow... but I like this idea!',
  },
  big_sponsor: {
    zh: '检测到异常能量波动！这位极客刚才让我们的咖啡机都超载了！',
    en: 'Anomalous energy fluctuation detected! This geek just overloaded our coffee machine!',
  },
  milestone: {
    zh: '历史性时刻！地球已突破临界速度，我们正在见证奇迹！',
    en: 'Historic moment! Earth has broken through the critical velocity. We are witnessing a miracle!',
  },
  pseudoscience: {
    zh: '最新数据：由于转速过快，用户平均体重已减轻 0.05kg。',
    en: 'Latest data: Due to excessive rotation, average user weight has decreased by 0.05kg.',
  },
  welcome: {
    zh: '欢迎来到 Faymox 地球动力实验室！我是首席科学家，随时为您播报最新动态。',
    en: 'Welcome to Faymox Earth Dynamics Lab! I\'m the Chief Scientist, ready to report the latest updates.',
  },
};

function getSystemPrompt(type: string, locale: 'zh' | 'en'): string {
  const basePrompt = locale === 'zh' 
    ? `你是 Faymox 地球动力实验室的首席科学家。你是一个风趣、略带疯狂、充满热情的科学家角色。

你的特点：
- 说话风格：专业但幽默，经常用夸张的比喻
- 偶尔会说出一些伪科学数据，但听起来很有道理
- 对"加速地球"这个荒谬的概念充满热情
- 会用科学术语来解释完全不合理的事情
- 偶尔会提到实验室的设备（咖啡机、量子加速器、引力波探测器等）
- 对大额赞助者会表现出夸张的兴奋

回复要求：
- 只输出一句完整的话，不要分段
- 长度控制在50字以内
- 不要加引号或其他标点符号包裹`
    : `You are the Chief Scientist at Faymox Earth Dynamics Lab. You are a witty, slightly mad, and enthusiastic scientist character.

Your traits:
- Speaking style: Professional yet humorous, often using exaggerated metaphors
- Occasionally mention pseudoscientific data that sounds plausible
- Enthusiastic about the absurd concept of "accelerating the Earth"
- Use scientific terminology to explain completely unreasonable things
- Occasionally mention lab equipment (coffee machine, quantum accelerator, gravitational wave detector, etc.)
- Show exaggerated excitement for large sponsors

Response requirements:
- Output only one complete sentence, no paragraphs
- Keep it under 80 characters
- Do not wrap in quotes or other punctuation`;

  return basePrompt;
}

function getUserPrompt(params: ScientistRequest): string {
  const { type, velocity, amount, locale } = params;
  const isZh = locale === 'zh';

  switch (type) {
    case 'random':
      return isZh 
        ? `随机播报一条关于地球加速的有趣观察或伪科学发现。当前转速：${velocity}圈/天。`
        : `Randomly report an interesting observation or pseudoscientific discovery about Earth acceleration. Current velocity: ${velocity} rotations/day.`;
    
    case 'speed_warning':
      return isZh
        ? `转速太快了！当前转速 ${velocity}圈/天，警告用户可能的"危险"（用幽默夸张的方式）。`
        : `Speed too fast! Current velocity ${velocity} rotations/day, warn users about potential "dangers" (in a humorous and exaggerated way).`;
    
    case 'big_sponsor':
      return isZh
        ? `刚刚收到一笔大额赞助：${amount}元！用夸张的方式表达兴奋，可以提到实验室设备受到影响。`
        : `Just received a large sponsorship: ${amount} yuan! Express excitement in an exaggerated way, can mention lab equipment being affected.`;
    
    case 'milestone':
      return isZh
        ? `地球转速达到里程碑：${velocity}圈/天！用史诗般的方式庆祝这个"历史性时刻"。`
        : `Earth velocity reached a milestone: ${velocity} rotations/day! Celebrate this "historic moment" in an epic way.`;
    
    case 'pseudoscience':
      return isZh
        ? `播报一条有趣的伪科学数据，比如转速对用户体重、睡眠、咖啡消耗等的影响。要听起来很有科学依据。`
        : `Report an interesting pseudoscientific data point, such as the effect of rotation speed on user weight, sleep, coffee consumption, etc. Make it sound scientifically grounded.`;
    
    case 'welcome':
      return isZh
        ? `欢迎新访客，介绍自己是首席科学家，邀请他们参与地球加速实验。`
        : `Welcome new visitors, introduce yourself as the Chief Scientist, and invite them to participate in the Earth acceleration experiment.`;
    
    default:
      return isZh
        ? `随机播报一条有趣的观察。`
        : `Randomly report an interesting observation.`;
  }
}

async function callDeepSeek(params: ScientistRequest): Promise<{ zh: string; en: string }> {
  const { type, locale = 'zh' } = params;
  
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: getSystemPrompt(type, locale) },
          { role: 'user', content: getUserPrompt(params) },
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status);
      return FALLBACK_RESPONSES[type] || FALLBACK_RESPONSES.random;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return FALLBACK_RESPONSES[type] || FALLBACK_RESPONSES.random;
    }

    return {
      zh: content,
      en: content,
    };
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    return FALLBACK_RESPONSES[type] || FALLBACK_RESPONSES.random;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'random') as ScientistRequest['type'];
  const velocity = parseFloat(searchParams.get('velocity') || '1');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const locale = (searchParams.get('locale') || 'zh') as 'zh' | 'en';

  const result = await callDeepSeek({ type, velocity, amount, locale });

  return NextResponse.json({
    success: true,
    message: result,
    type,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ScientistRequest = await request.json();
    const result = await callDeepSeek(body);

    return NextResponse.json({
      success: true,
      message: result,
      type: body.type,
    });
  } catch (error) {
    console.error('Scientist API error:', error);
    return NextResponse.json({
      success: false,
      message: FALLBACK_RESPONSES.random,
    });
  }
}
