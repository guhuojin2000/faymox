import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-45e2ae6a57694c76bce99a2dfdde859c';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, locale } = await request.json();
    
    if (!message || message.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    const systemPrompt = locale === 'zh' 
      ? `你是 Faymox 地球动力实验室的引力宣言润色专家。你的任务是将用户的简单留言转化为富有科技感、极客风格的引力宣言。

要求：
1. 保持原意，但增加科技感和幽默感
2. 使用物理、天文、编程相关的术语
3. 长度控制在30-50字
4. 必须包含至少一个emoji
5. 风格可以是：极客幽默、伪科学、哲学思考、开发梗

示例：
输入："支持一下"
输出："量子纠缠已确认！我的支持能量正在穿越时空隧道抵达地球核心 ⚡️"

输入："加油"
输出："编译成功！注入正能量包，地球转速优化中... 🚀"

输入："很有意思的项目"
输出："检测到高能兴趣粒子！正在转化为地球动力... 引力场 +1 🌍"`
      : `You are the Gravity Declaration Polish Expert at Faymox Earth Dynamics Lab. Your task is to transform simple user messages into tech-savvy, geeky gravity declarations.

Requirements:
1. Keep the original meaning but add tech flavor and humor
2. Use physics, astronomy, programming terminology
3. Keep length between 30-50 characters
4. Must include at least one emoji
5. Style can be: geek humor, pseudoscience, philosophical, dev jokes

Examples:
Input: "Support!"
Output: "Quantum entanglement confirmed! My support energy is tunneling through spacetime to Earth's core ⚡️"

Input: "Keep it up"
Output: "Build successful! Deploying positive energy packet, Earth rotation optimizing... 🚀"

Input: "Interesting project"
Output: "High-energy interest particles detected! Converting to Earth momentum... Gravity +1 🌍"`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请润色这条引力宣言：${message}` }
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const polishedMessage = data.choices?.[0]?.message?.content || message;

    return NextResponse.json({
      success: true,
      message: {
        original: message,
        polished: polishedMessage,
      }
    });

  } catch (error) {
    console.error('Polish message error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to polish message' 
    }, { status: 500 });
  }
}
