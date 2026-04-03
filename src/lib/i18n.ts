// 多语言配置
export type Locale = 'zh' | 'en';

export const translations = {
  en: {
    // 核心文案
    tagline: "The developer hasn't decided what to build yet, so let's speed up the Earth together.",
    
    // 速度仪表盘
    currentVelocity: "Current Velocity",
    rotationsPerDay: "Rotations/Day",
    
    // 支付
    buyMeCoffee: "Buy me a coffee",
    supportDeveloper: "Support the developer",
    igniteMomentum: "Ignite Momentum",
    addMomentum: "Add Momentum",
    chooseAmount: "Choose amount",
    customAmount: "Custom amount",
    leaveMessage: "Leave your acceleration message (optional)",
    paymentSuccess: "Payment successful! Earth is spinning faster!",
    paymentFailed: "Payment failed. Please try again.",
    paymentPending: "Payment pending...",
    
    // 分享
    share: "Share",
    shareText: (amount: number, velocity: number) => 
      `I just added ${amount} units of momentum to the Earth on faymox.com. Current speed: ${velocity.toFixed(2)} rotations/day!`,
    
    // 其他
    poweredBy: "Powered by curiosity",
    wechatPay: "WeChat Pay",
    loading: "Loading...",
    projectName: "Project Earth Accelerator",
  },
  zh: {
    // 核心文案
    tagline: "既然还没想好做什么，不如先让地球转快点吧。",
    
    // 速度仪表盘
    currentVelocity: "当前转速",
    rotationsPerDay: "圈/天",
    
    // 支付
    buyMeCoffee: "请我喝咖啡",
    supportDeveloper: "支持开发者",
    igniteMomentum: "注入动力",
    addMomentum: "添加动力",
    chooseAmount: "选择金额",
    customAmount: "自定义金额",
    leaveMessage: "留下你的加速宣言（可选）",
    paymentSuccess: "支付成功！地球转得更快了！",
    paymentFailed: "支付失败，请重试。",
    paymentPending: "支付处理中...",
    
    // 分享
    share: "分享",
    shareText: (amount: number, velocity: number) => 
      `我刚才在 faymox.com 为地球贡献了 ${amount} 圈/天的动力！当前自转速度：${velocity.toFixed(2)} 圈/天！`,
    
    // 其他
    poweredBy: "Powered by curiosity",
    wechatPay: "微信支付",
    loading: "加载中...",
    projectName: "项目代号：地球加速",
  }
};

// 检测浏览器语言
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// 获取翻译
export function getTranslations(locale: Locale) {
  return translations[locale];
}
