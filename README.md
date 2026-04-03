# Faymox - 地球加速器 🌍

> 既然还没想好做什么，不如先让地球转快点吧。

## 🚀 部署到 faymox.com（免备案）

### 前提条件
- 拥有 faymox.com 域名
- 有 GitHub 账号
- 有 Vercel 账号（可用 GitHub 登录）

---

## 第一步：推送代码到 GitHub

### 1.1 创建 GitHub 仓库

1. 打开 https://github.com/new
2. 仓库名填写：`faymox`
3. 选择 **Private**（私有仓库）
4. 点击 **Create repository**

### 1.2 推送代码

在终端执行以下命令：

```bash
# 进入项目目录
cd /home/z/my-project

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Faymox V2.0 - 地球加速器"

# 关联远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/faymox.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 第二步：创建 Vercel Postgres 数据库

### 2.1 登录 Vercel

1. 打开 https://vercel.com
2. 使用 GitHub 账号登录

### 2.2 创建数据库

1. 点击顶部导航的 **Storage** 标签
2. 点击 **Create Database**
3. 选择 **Postgres**
4. 数据库名填写：`faymox-db`
5. 区域选择：**Washington, D.C., USA, East America - iad1**（或任意海外区域）
6. 点击 **Create**

### 2.3 获取数据库连接信息

1. 创建完成后，点击数据库进入详情页
2. 点击右上角 **Connect** 按钮
3. 在弹窗中选择 **Prisma**
4. 复制显示的环境变量（类似下面）：
   ```
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   POSTGRES_USER="..."
   POSTGRES_HOST="..."
   POSTGRES_PASSWORD="..."
   POSTGRES_DATABASE="..."
   ```

---

## 第三步：部署项目到 Vercel

### 3.1 创建新项目

1. 点击 Vercel 控制台的 **Add New...** → **Project**
2. 选择 **Import Git Repository**
3. 找到并选择你的 `faymox` 仓库
4. 点击 **Import**

### 3.2 配置项目

在 **Configure Project** 页面：

1. **Framework Preset**: 选择 `Next.js`
2. **Root Directory**: 保持 `./`
3. **Build Command**: 使用默认
4. **Output Directory**: 使用默认

### 3.3 配置环境变量

点击 **Environment Variables** 展开，添加以下变量：

```
DATABASE_URL = [从 Vercel Postgres 复制的 POSTGRES_PRISMA_URL]
DIRECT_DATABASE_URL = [从 Vercel Postgres 复制的 POSTGRES_URL_NON_POOLING]
```

> 💡 提示：这两个值可以在 Vercel Storage → Postgres → Connect → Prisma 中找到

### 3.4 修改 Prisma Schema

**重要！** 在部署前，需要修改 Prisma schema 支持 Postgres：

在 GitHub 仓库中，将 `prisma/schema.prisma` 文件内容替换为 `prisma/schema.prod.prisma` 的内容：

```bash
# 或者直接编辑 prisma/schema.prisma，将 provider 从 "sqlite" 改为 "postgresql"
```

### 3.5 部署

1. 点击 **Deploy**
2. 等待构建完成（约 2-3 分钟）
3. 看到庆祝页面表示部署成功！

---

## 第四步：绑定域名 faymox.com

### 4.1 添加域名

1. 进入项目页面，点击 **Settings**
2. 左侧菜单选择 **Domains**
3. 输入 `faymox.com`，点击 **Add**
4. 再添加 `www.faymox.com`

### 4.2 配置 DNS

Vercel 会显示需要配置的 DNS 记录。在你的域名服务商（如阿里云、腾讯云、GoDaddy 等）配置：

**对于 faymox.com：**
| 类型 | 名称 | 值 |
|------|------|------|
| A | @ | 76.76.21.21 |

**对于 www.faymox.com：**
| 类型 | 名称 | 值 |
|------|------|------|
| CNAME | www | cname.vercel-dns.com |

> 💡 如果 Vercel 显示不同的 IP 地址，请使用 Vercel 提供的地址

### 4.3 等待 DNS 生效

- DNS 生效通常需要 5-30 分钟
- 生效后访问 https://faymox.com 即可看到你的网站！

---

## 第五步：初始化数据库

部署成功后，需要初始化数据库表：

### 方法一：使用 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 拉取环境变量
vercel env pull

# 推送数据库 schema
npx prisma db push
```

### 方法二：在 Vercel 控制台执行

1. 进入项目 → **Storage** → 选择你的 Postgres 数据库
2. 点击 **Query** 标签
3. 执行以下 SQL：

```sql
CREATE TABLE "GlobalStats" (
  "id" TEXT PRIMARY KEY DEFAULT 'global',
  "totalAmount" REAL DEFAULT 0,
  "baseSpeed" REAL DEFAULT 1,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "outTradeNo" TEXT UNIQUE,
  "payUrl" TEXT,
  "amount" REAL,
  "status" TEXT DEFAULT 'pending',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "GlobalStats" ("id", "totalAmount", "baseSpeed") VALUES ('global', 0, 1);
```

---

## 🔧 常见问题

### Q: 部署后网站打不开？

检查 Vercel 控制台的 **Deployments** 页面，查看是否有报错。

### Q: 数据库连接失败？

确认环境变量 `DATABASE_URL` 和 `DIRECT_DATABASE_URL` 已正确设置。

### Q: 域名解析不生效？

- 确认 DNS 记录配置正确
- 等待 DNS 缓存刷新（最长 48 小时）
- 使用 `nslookup faymox.com` 检查解析结果

---

## 📁 本地开发

```bash
# 安装依赖
bun install

# 初始化数据库
bun run db:push

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000

---

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **3D**: Three.js + React Three Fiber
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Prisma + Vercel Postgres
- **AI**: DeepSeek API（弹幕生成）
