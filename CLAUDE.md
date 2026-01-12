# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI导航是一个基于 Cloudflare Workers 的 AI 工具推荐平台,通过 SiliconFlow API 调用 DeepSeek 模型分析用户需求并推荐合适的 AI 产品。

**技术栈:**
- 后端: Cloudflare Workers + Hono (边缘计算框架)
- AI: SiliconFlow + DeepSeek-V2.5 模型
- 前端: 原生 HTML/CSS/JavaScript (无构建工具)

**核心文件:**
- `worker/src/index.js` - 主 API 服务,包含推荐逻辑和产品库
- `frontend/index.html` - 前端界面(包含 HTML/CSS/JavaScript)
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
# 设置生产环境 API 密钥
cd worker
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY

# 部署到 Cloudflare Workers
npx wrangler deploy

# 查看实时日志
npx wrangler tail
```

## 架构设计

### API 推荐流程

1. **AI 分析优先**: 调用 SiliconFlow API (DeepSeek-V2.5) 分析用户任务描述
2. **关键词提取**: AI 从预定义关键词中选择 1-2 个最相关的 (文档/视频/音频等)
3. **产品匹配**: 根据关键词从产品库 (`PRODUCTS` 对象) 中获取推荐
4. **降级策略**: AI 失败时自动退回到简单关键词匹配
5. **去重与限制**: 返回最多 3 个不重复的产品推荐

### 环境变量管理

- **本地开发**: 使用 `worker/.dev.vars` (已加入 .gitignore)
- **生产环境**: 使用 Cloudflare Secrets (`wrangler secret put`)
- **配置示例**: 参考 `.env.example`

必需变量:
```
SILICONFLOW_API_KEY=sk-xxx
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V2.5
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

- `GET /` - 健康检查
- `POST /api/recommend` - 智能推荐 (接收 `{query: string}`)
- `GET /api/cases` - 典型案例列表

## 开发注意事项

### 修改推荐逻辑时

1. 系统提示词在 `callAI()` 函数中,需要与 `PRODUCTS` 关键词保持同步
2. 修改 `max_tokens` 或 `temperature` 会影响 AI 响应质量和成本
3. 添加新关键词时必须同时更新系统提示词和产品库

### 前后端配置

前端 API 地址配置在 `frontend/index.html` 的 JavaScript 部分:
```javascript
const API_BASE = 'https://ai-nav-api.your-account.workers.dev';  // 生产环境
// const API_BASE = 'http://localhost:8787';  // 本地开发
```

### 成本优化

- 当前使用 DeepSeek-V2.5 (¥0.14/M tokens)
- 可切换到更便宜的 Qwen2.5-7B (修改 `SILICONFLOW_MODEL` 环境变量)
- 降级方案可避免不必要的 API 调用

### 部署验证

部署后测试生产环境:
```bash
export WORKER_URL="https://your-worker.workers.dev"
curl $WORKER_URL/
curl -X POST $WORKER_URL/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "测试查询"}'
```
