# 🏭 公众号内容工厂

AI 驱动的公众号内容创作平台 - 从选题分析到内容发布的一站式解决方案

## ✨ 功能特性

### 📊 选题分析
- 关键词搜索公众号文章
- AI 自动生成文章概要
- 数据驱动的选题洞察报告
- 点赞量/互动率 TOP 5 分析
- 高频词云可视化
- 5 个核心选题方向推荐

### ✍️ 内容创作
- 基于选题洞察或自定义主题创作
- AI 自动生成高质量文章
- Unsplash 自动配图
- 实时创作进度展示
- 文章预览和编辑功能

### 📝 发布管理
- 文章状态管理（草稿/已发布/发布失败）
- 一键发布到公众号
- 文章搜索和筛选
- 批量操作支持
- 发布数据统计

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## 📁 项目结构

```
content-factory/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页/仪表盘
│   ├── analysis/          # 选题分析页面
│   ├── creation/          # 内容创作页面
│   └── publish/           # 发布管理页面
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   └── sidebar.tsx       # 侧边栏导航
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具
├── public/               # 静态资源
└── package.json          # 项目配置
```

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: 自定义组件库（基于 shadcn/ui 风格）
- **图标**: Lucide React
- **数据库**: SQLite（待实现）

## 🎯 开发计划

### 当前阶段：前端原型 ✅
- [x] 页面布局和导航
- [x] 仪表盘页面
- [x] 选题分析页面
- [x] 内容创作页面
- [x] 发布管理页面

### 下一阶段：后端实现
- [ ] API 路由设计
- [ ] 数据库集成
- [ ] 第三方 API 集成
  - [ ] 公众号文章搜索 API
  - [ ] OpenAI 兼容接口
  - [ ] Unsplash API
  - [ ] 公众号发布 API
- [ ] 文章 CRUD 功能
- [ ] AI 分析和创作逻辑

### 未来优化
- [ ] 用户认证系统
- [ ] 定时发布功能
- [ ] 数据分析看板
- [ ] 文章模板系统
- [ ] 多账号管理

## 📝 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 本项目目前处于原型阶段，后端功能尚未实现。所有数据均为模拟数据。
