# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI导航是一个基于 Cloudflare Workers 的 AI 工具推荐平台,采用三模型智能架构,根据任务复杂度自动选择最合适的 AI 模型进行分析和推荐。

**技术栈:**
- 后端: Cloudflare Workers + Hono (边缘计算框架)
- AI: SiliconFlow 平台 + 三模型架构 (Qwen 7B / GLM 4-9B / DeepSeek-V3)
- 搜索: Tavily API (联网搜索增强)
- 安全: Cloudflare Turnstile (人机验证)
- 前端: 原生 HTML/CSS/JavaScript (无构建工具)

**核心文件:**
- `worker/src/index.js` - 主 API 服务,包含三模型推荐逻辑和产品库
- `worker/src/frontend.html` - 前端生产版本 (包含 Turnstile)
- `frontend/index.html` - 前端开发版本 (与 frontend.html 同步)
- `worker/wrangler.toml` - Cloudflare Workers 配置

## 常用命令

### 开发环境

```bash
# 启动后端 API 服务 (默认端口 8787)
cd worker
npm install
npx wrangler dev --port 8787

# 启动前端服务 (端口 3000)
cd frontend
python3 -m http.server 3000
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
# 设置生产环境密钥
cd worker
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY
echo "your_tavily_key" | npx wrangler secret put TAVILY_API_KEY  # 可选,用于联网搜索
echo "your_turnstile_secret" | npx wrangler secret put TURNSTILE_SECRET_KEY  # 推荐,防止滥用

# 部署到 Cloudflare Workers
npx wrangler deploy

# 查看实时日志
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

### 产品库扩展

在 `worker/src/index.js` 中修改 `PRODUCTS` 对象:
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

1. **前端开发**: 修改 `frontend/index.html`
2. **同步到生产**: 将修改复制到 `worker/src/frontend.html`
3. **API 地址**: 配置在 HTML 的 JavaScript 部分
   ```javascript
   const API_BASE = window.location.origin;  // 生产环境自动获取
   // const API_BASE = 'http://localhost:8787';  // 本地开发可切换
   ```
4. **Turnstile Site Key**: 在 `worker/src/frontend.html` 的 `data-sitekey` 属性中配置

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
