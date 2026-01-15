# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI导航是一个基于 Cloudflare Workers 的 AI 工具推荐平台,采用三模型智能架构,根据任务复杂度自动选择最合适的 AI 模型进行分析和推荐。

**技术栈:**
- 后端: Cloudflare Workers + Hono (边缘计算框架)
- AI: SiliconFlow 平台 + 三模型架构 (Qwen 7B / GLM 4-9B / DeepSeek-V3)
- 搜索: Tavily API (联网搜索增强)
- 安全: Cloudflare Turnstile (人机验证)
- 前端: Vue 3 + Vite (模块化组件架构)

**核心文件:**
- `worker/src/index.js` - 主 API 服务和三模型推荐逻辑
- `worker/src/data.js` - 产品库和模型配置
- `worker/src/scenarioTemplates.js` - 预设场景模板
- `worker/src/webSearch.js` - 联网搜索集成
- `frontend/src/App.vue` - 主应用组件
- `frontend/src/components/` - Vue 组件 (ProductCard, StepCard, FavoritesModal, HistoryTags)
- `worker/wrangler.toml` - Cloudflare Workers 配置 (包含 assets 绑定)

## 常用命令

### 开发环境

```bash
# 1. 启动后端 API 服务 (默认端口 8787)
cd worker
npm install
npx wrangler dev --port 8787

# 2. 在另一个终端启动前端 Vue 开发服务器 (默认端口 5173)
cd frontend
npm install
npm run dev

# 注意: 前端会自动代理 API 请求到 http://localhost:8787
```

### 测试

```bash
# 运行 API 测试套件
cd tests
node test_api.js

# 或使用 Python 版本
python3 test_api.py

# 手动测试单个端点
curl http://localhost:8787/
curl -X POST http://localhost:8787/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "我想剪辑视频"}'
curl http://localhost:8787/api/cases
```

### 部署

```bash
# 1. 构建前端 Vue 应用
cd frontend
npm run build  # 输出到 frontend/dist

# 2. 设置生产环境密钥
cd ../worker
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY
echo "your_tavily_key" | npx wrangler secret put TAVILY_API_KEY  # 可选,用于联网搜索
echo "your_turnstile_secret" | npx wrangler secret put TURNSTILE_SECRET_KEY  # 推荐,防止滥用

# 3. 部署到 Cloudflare Workers (自动包含 frontend/dist 中的静态资源)
npx wrangler deploy

# 4. 查看实时日志
npx wrangler tail
```

## 架构设计

### 三模型智能推荐流程

1. **任务分类**: 首次调用 Qwen 7B 模型分析任务复杂度 (简单/中等/复杂)
2. **模型选择**: 根据复杂度选择合适的模型
   - 简单 (direct): Qwen 7B - 直接推荐工具
   - 中等 (workflow): GLM 4-9B - 提供简单工作流
   - 复杂 (workflow + search): DeepSeek-V3 - 联网搜索 + 复杂工作流
3. **关键词提取**: AI 从预定义关键词中选择最相关的 (文档/视频/音频等)
4. **产品匹配**: 根据关键词从产品库 (`PRODUCTS` 对象) 中获取推荐
5. **联网搜索**: 复杂任务通过 Tavily API 搜索最新信息
6. **工作流生成**: 中等和复杂任务生成详细的执行步骤
7. **降级策略**: AI 失败时自动退回到简单关键词匹配
8. **人机验证**: 生产环境强制 Turnstile 验证

### 环境变量管理

- **本地开发**: 使用 `worker/.dev.vars` (已加入 .gitignore)
- **生产环境**: 使用 Cloudflare Secrets (`wrangler secret put`)
- **配置示例**: 参考 `.env.example`

必需变量:
```
SILICONFLOW_API_KEY=sk-xxx
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
# 注意: 无需配置单一模型,系统会自动选择 Qwen 7B / GLM 4-9B / DeepSeek-V3
```

可选变量:
```
TAVILY_API_KEY=tvly-xxx          # 联网搜索 (复杂任务)
TURNSTILE_SECRET_KEY=0x4...      # 人机验证 (强烈推荐)
ENVIRONMENT=production           # 环境标识
```

### 前端架构 (Vue 3 + Vite)

前端采用 Vue 3 Composition API 和组件化设计:

**主要组件:**
- `App.vue` - 主应用,包含搜索、结果展示、收藏管理
- `ProductCard.vue` - 产品推荐卡片
- `StepCard.vue` - 工作流步骤卡片
- `FavoritesModal.vue` - 收藏夹弹窗
- `HistoryTags.vue` - 搜索历史标签

**状态管理:**
- 使用 `localStorage` 存储搜索历史和收藏
- Turnstile token 管理通过全局回调函数

**构建配置:**
- `vite.config.js` - Vite 配置
- 构建输出: `frontend/dist` → 通过 `wrangler.toml` 的 `[assets]` 绑定到 Workers

### 产品库扩展

在 `worker/src/data.js` 中修改 `PRODUCTS` 对象:
```javascript
const PRODUCTS = {
  '关键词': [
    { name: '产品名', url: '产品链接', desc: '产品描述' }
  ]
};
```

关键词会被用于:
1. AI 系统提示词中的候选关键词
2. 降级方案的关键词匹配

### API 端点

- `GET /` - 前端页面 (包含 Turnstile 人机验证)
- `POST /api/recommend` - 智能推荐 (接收 `{query: string}`, 需要 `CF-Turnstile-Token` 请求头)
- `GET /api/scenarios` - 5 个预设场景工作流模板
- `GET /api/cases` - 典型案例列表

## 开发注意事项

### 修改推荐逻辑时

1. **三个 AI 调用函数需要协调修改**:
   - `classifyTaskComplexity()` - 任务分类 (Qwen 7B)
   - `analyzeTaskSimple()` - 简单任务分析 (Qwen 7B)
   - `analyzeTaskWorkflow()` - 工作流分析 (GLM 4-9B / DeepSeek-V3)
2. 系统提示词需要与 `PRODUCTS` 关键词保持同步
3. 修改 `max_tokens` 或 `temperature` 会影响 AI 响应质量和成本
4. 添加新关键词时必须同时更新所有系统提示词和产品库
5. 复杂任务会触发 Tavily 搜索,注意 API 用量限制

### 前后端配置

1. **前端开发**:
   - 修改 Vue 组件: `frontend/src/App.vue` 和 `frontend/src/components/*.vue`
   - Vite 自动热更新,无需手动刷新

2. **前端构建**:
   - 运行 `npm run build` 生成 `frontend/dist`
   - `wrangler.toml` 中的 `[assets]` 配置自动将 `dist` 部署到 Workers
   - **重要**: 每次前端修改后必须重新构建才能部署

3. **API 配置**:
   - 开发环境: 检测到 `localhost` 时自动使用 `http://localhost:8787`
   - 生产环境: 通过 `window.location.origin` 自动获取
   - 配置位置: `App.vue` 中的 `API_BASE` 常量

4. **Turnstile 配置**:
   - Site Key: 在 `App.vue` 的 `turnstileSiteKey` 变量中配置
   - Secret Key: 使用 `wrangler secret put TURNSTILE_SECRET_KEY` 设置

### 成本优化

- **三模型分级计费**:
  - 简单任务 (80%): Qwen 7B - ¥0.14/M tokens
  - 中等任务 (15%): GLM 4-9B - ¥0.7/M tokens
  - 复杂任务 (5%): DeepSeek-V3 - ¥2.0/M tokens
- **智能降级**: AI 失败时自动退回关键词匹配,避免重复调用
- **Turnstile 保护**: 防止恶意请求消耗 API 额度
- **预估成本**: 约 ¥50-100/月 (1000 次调用/天)

### 部署验证

部署后测试生产环境:
```bash
export WORKER_URL="https://your-worker.workers.dev"
curl $WORKER_URL/
curl -X POST $WORKER_URL/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "测试查询"}'
```
