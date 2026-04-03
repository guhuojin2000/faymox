# Faymox 项目开发日志

---
Task ID: 1
Agent: Main Developer
Task: 创建 Faymox 项目 - 让地球转得更快的创意网站

Work Log:
- 安装依赖：three, @react-three/fiber, @react-three/drei, next-themes
- 创建多语言系统 (src/lib/i18n.ts, src/lib/locale-context.tsx)
- 创建 3D 地球场景组件 (src/components/earth-scene.tsx)
  - 使用 NASA 蓝色大理石贴图
  - 实现真实昼夜效果（自定义着色器）
  - 实现云层、大气层光晕
  - 性能优化：低端设备自动降低精度
- 创建速度仪表盘组件 (src/components/velocity-display.tsx)
  - 数字跳动动画效果
  - 速度指示条
- 创建数据库模型 (prisma/schema.prisma)
  - GlobalStats: 全局统计（总金额、基础转速）
  - Payment: 支付记录
- 创建 API 路由
  - /api/stats: 获取当前转速
  - /api/pay: 创建/查询支付订单
  - /api/pay/notify: 支付回调
- 创建支付组件 (src/components/payment-dialog.tsx)
  - 预设金额选择
  - 自定义金额输入
  - 微信扫码支付
  - 支付状态轮询
- 创建分享组件 (src/components/share-button.tsx)
  - 支持原生分享 API
  - 自动生成分享文案
- 创建语言切换组件 (src/components/locale-switcher.tsx)
- 创建主页面 (src/app/page.tsx)
- 更新布局和元数据 (src/app/layout.tsx)
- 实现彩蛋效果：转速超过 1000 时地球发蓝光

Stage Summary:
- 项目已基本完成，可在预览面板查看
- 支付功能需要配置 YungouOS 凭证才能使用
- 多语言支持（中英文自动检测）
- 响应式设计，支持手机和桌面端

---
Task ID: 2
Agent: Main Developer
Task: 部署配置和说明

Work Log:
- 创建 .env.example 文件说明环境变量配置
- 修复 ESLint 错误
- 测试项目运行状态

Stage Summary:
- 项目已准备好部署
- 需要用户配置 YungouOS 凭证才能启用支付功能

---

## 部署说明

### 1. 配置微信支付 (YungouOS)

1. 访问 [YungouOS](https://www.yungouos.com) 注册账号
2. 开通微信支付功能
3. 获取以下信息：
   - 应用ID (YUNGOUS_APP_ID)
   - 应用密钥 (YUNGOUS_APP_SECRET)
   - 商户号 (YUNGOUS_MCH_ID)
4. 在 `.env` 文件中添加这些环境变量

### 2. 免费部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. 配置环境变量
5. 部署完成后绑定自定义域名 faymox.com

### 3. 域名配置

在域名 DNS 管理面板添加以下记录：
- 类型: A
- 名称: @
- 值: Vercel 提供的 IP 地址

或者使用 CNAME：
- 类型: CNAME
- 名称: @
- 值: cname.vercel-dns.com
