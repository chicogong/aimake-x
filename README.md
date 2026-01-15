# AI导航

**Slogan：** 找到最适合你的 AI 工具

## 项目简介

AI导航是一个 **AI 产品推荐与导航平台**，帮助用户快速找到最适合自己需求的 AI 工具。

**核心价值：**
- **精准推荐**：根据任务描述，智能匹配最合适的 AI 产品
- **降低门槛**：用户无需了解各种 AI 工具，我们帮你选
- **持续更新**：跟踪主流 AI 产品动态，保持推荐的时效性

## 在线体验

🌐 **在线地址：** https://x.aimake.cc

```bash
# 智能推荐
curl -X POST https://x.aimake.cc/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "我想剪辑一个视频并添加字幕"}'

# 查看案例
curl https://x.aimake.cc/api/cases
```

## 技术架构

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 后端 | Cloudflare Workers + Hono | 边缘计算，全球加速 |
| AI | SiliconFlow + 三模型架构 | Qwen 7B / GLM 4-9B / DeepSeek-V3，智能分级推荐 |
| 前端 | Vue 3 + Vite | 模块化组件，支持 Dark Mode |
| 搜索 | Tavily API | 联网搜索增强（可选）|
| 安全 | Cloudflare Turnstile | 人机验证防滥用 |

## 项目结构

```
aimake-x/
├── frontend/                # Vue 3 前端项目
│   ├── src/
│   │   ├── App.vue          # 主应用组件
│   │   ├── main.js          # 入口文件
│   │   └── components/      # Vue 组件
│   │       ├── ProductCard.vue      # 产品卡片
│   │       ├── StepCard.vue         # 工作流步骤
│   │       ├── FavoritesModal.vue   # 收藏弹窗
│   │       └── HistoryTags.vue      # 搜索历史
│   ├── public/              # 静态资源
│   ├── dist/                # 构建输出（由 Vite 生成）
│   ├── vite.config.js       # Vite 配置
│   └── package.json         # 前端依赖
├── worker/                  # Cloudflare Worker 后端
│   ├── src/
│   │   ├── index.js         # 主 API 服务
│   │   ├── data.js          # 产品库和模型配置
│   │   ├── scenarioTemplates.js  # 预设场景模板
│   │   └── webSearch.js     # 联网搜索集成
│   ├── wrangler.toml        # Cloudflare 配置（含 assets 绑定）
│   ├── .dev.vars            # 本地环境变量（不提交）
│   └── package.json         # 后端依赖
├── tests/                   # 测试文件
│   ├── test_api.js          # API 测试
│   └── integration_test.js  # 集成测试
├── README.md                # 项目说明
├── CLAUDE.md                # 开发指南
├── DEPLOYMENT.md            # 部署说明
├── TURNSTILE_SETUP.md       # Turnstile 配置
└── .env.example             # 环境变量模板
```

## 快速开始

### 本地开发

```bash
# 1. 安装后端依赖
cd worker
npm install

# 2. 配置环境变量（创建 .dev.vars 文件）
echo "SILICONFLOW_API_KEY=your_api_key" > .dev.vars

# 3. 启动后端服务器（默认端口 8787）
npx wrangler dev --port 8787

# 4. 在另一个终端，安装并启动前端（默认端口 5173）
cd ../frontend
npm install
npm run dev

# 5. 访问前端页面
# 浏览器打开 http://localhost:5173
# 前端会自动代理 API 请求到后端 http://localhost:8787
```

### 测试 API

```bash
# 视频剪辑推荐
curl -X POST http://localhost:8787/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "我想剪辑一个视频并添加字幕"}'

# 预期返回：剪映、必剪
```

## 支持的场景

| 场景 | 关键词 | 推荐产品 |
|------|-------|---------|
| 视频剪辑、字幕 | 视频 | 剪映、必剪 |
| 文档处理、长文本 | 文档 | Kimi、WPS AI、飞书 AI |
| 会议记录、音频转写 | 音频、会议 | 通义听悟、讯飞听见、飞书 AI |
| 代码生成 | 代码 | 通义灵码、Cursor |
| 合同审查、法律 | 合同、法律 | Kimi、法狗狗、无讼 |
| 表格处理、Excel | 表格 | ChatExcel、WPS AI |
| 文案写作 | 写作 | 豆包、讯飞星火 |
| AI绘画、图片生成 | 绘画 | 文心一格、通义万相 |

## API 文档

### POST /api/recommend

智能推荐 AI 产品。

**请求：**
```json
{
  "query": "任务描述"
}
```

**响应：**
```json
{
  "query": "任务描述",
  "matchedKeywords": ["匹配的关键词"],
  "recommendations": [
    {
      "name": "产品名",
      "url": "产品链接",
      "desc": "产品描述"
    }
  ],
  "timestamp": 1234567890
}
```

### GET /api/cases

获取典型案例列表。

**响应：**
```json
{
  "cases": [
    {
      "id": "案例ID",
      "title": "标题",
      "desc": "问题描述",
      "solution": "解决方案",
      "products": ["推荐产品"]
    }
  ]
}
```

## 部署

### 快速部署

```bash
# 1. 构建前端 Vue 应用
cd frontend
npm run build  # 输出到 frontend/dist

# 2. 部署到 Cloudflare Workers
cd ../worker
npx wrangler deploy  # 自动包含 frontend/dist 中的静态资源

# 3. 设置生产环境密钥
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY
echo "your_turnstile_secret" | npx wrangler secret put TURNSTILE_SECRET_KEY  # 推荐
```

详细部署说明和配置请参考 [DEPLOYMENT.md](DEPLOYMENT.md)。

### 人机验证（可选）

为防止 API 滥用，项目集成了 Cloudflare Turnstile 人机验证。详细设置步骤请参考 [TURNSTILE_SETUP.md](TURNSTILE_SETUP.md)。

**特点：**
- 完全免费，无使用限制
- 用户体验好，大多数情况下无感知
- 有效防止爬虫和恶意请求

## 成本估算

- **启动成本**：约 100 元（域名 + API 测试）
- **月运营成本**：约 50 元（1000 次调用/天）

## 许可证

MIT License
