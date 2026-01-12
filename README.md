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
| AI | SiliconFlow + DeepSeek-V2.5 | 性价比高（¥0.14/M tokens）|
| 前端 | HTML + CSS + JavaScript | 原生实现，Dark Mode |

## 项目结构

```
aimake-x/
├── frontend/                # 前端源代码
│   └── index.html           # 主页面（开发版本）
├── worker/                  # Cloudflare Worker
│   ├── src/
│   │   ├── index.js         # API 实现 + 前端服务
│   │   └── frontend.js      # 前端 HTML（生产版本）
│   ├── wrangler.toml        # Cloudflare 配置
│   └── .dev.vars            # 本地开发环境变量（不提交）
├── tests/                   # 测试文件
├── README.md                # 项目说明
├── DEPLOYMENT.md            # 部署说明
└── CLAUDE.md                # 开发指南
```

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
cd worker
npm install

# 2. 配置环境变量（创建 .dev.vars 文件）
echo "SILICONFLOW_API_KEY=your_api_key" > .dev.vars

# 3. 启动开发服务器
npx wrangler dev --port 8787

# 4. 访问 http://localhost:8787
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

参考 [DEPLOYMENT.md](DEPLOYMENT.md) 了解如何部署到 Cloudflare Workers。

## 成本估算

- **启动成本**：约 100 元（域名 + API 测试）
- **月运营成本**：约 50 元（1000 次调用/天）

## 许可证

MIT License
