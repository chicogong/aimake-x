# 部署说明

## 部署步骤

### 1. 安装依赖

```bash
cd worker
npm install
```

### 2. 配置环境变量

创建 `worker/.dev.vars` 文件（本地开发）：

```
SILICONFLOW_API_KEY=your_api_key_here
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
```

**注意：** 项目使用三模型架构，无需配置单一模型，系统会根据任务复杂度自动选择：
- 简单任务：Qwen/Qwen2.5-7B-Instruct
- 中等任务：THUDM/glm-4-9b-chat
- 复杂任务：deepseek-ai/DeepSeek-V3

### 3. 本地测试

```bash
cd worker
npx wrangler dev --port 8787
```

### 4. 配置人机验证（推荐）

配置 Cloudflare Turnstile 防止 API 滥用（详细步骤见 [TURNSTILE_SETUP.md](TURNSTILE_SETUP.md)）：

```bash
# 设置 Turnstile Secret Key
echo "your_turnstile_secret" | npx wrangler secret put TURNSTILE_SECRET_KEY

# 前端配置：更新 worker/src/frontend.html 中的 Site Key
# 找到 data-sitekey 属性，替换为你的 Site Key
```

### 5. 部署到 Cloudflare

```bash
# 设置生产环境 API 密钥
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY

# 部署
npx wrangler deploy
```

部署后会得到一个 URL：`https://<worker-name>.<account>.workers.dev`

**重要：** Worker 同时提供前端页面和 API 服务：
- 前端页面：访问根路径 `/`
- API 端点：`/api/recommend`, `/api/scenarios`, `/api/cases`

## API 端点

### 1. 前端页面
```bash
GET /
```

返回完整的前端 HTML 页面（包含人机验证）

### 2. 智能推荐
```bash
POST /api/recommend
Content-Type: application/json
CF-Turnstile-Token: <验证令牌>  # 生产环境必需

{
  "query": "我想处理一份合同文档"
}
```

响应示例：
```json
{
  "query": "我想处理一份合同文档",
  "mode": "direct",
  "complexity": "simple",
  "matchedKeywords": ["合同"],
  "recommendations": [
    {
      "name": "Kimi",
      "url": "https://kimi.moonshot.cn",
      "desc": "长文本分析，支持合同对比"
    }
  ],
  "timestamp": 1736640000000
}
```

**注意：**
- 生产环境需要在请求头中包含 `CF-Turnstile-Token`
- 本地开发环境会跳过人机验证

### 3. 场景模板
```bash
GET /api/scenarios
```

返回 5 个预设场景工作流模板。

### 4. 案例列表
```bash
GET /api/cases
```

返回典型应用案例。

## 测试命令

```bash
# 健康检查
curl http://localhost:8787/

# 智能推荐
curl -X POST http://localhost:8787/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "我想剪辑一个视频"}'

# 案例列表
curl http://localhost:8787/api/cases
```

## 技术细节

### 三模型智能推荐架构

系统根据任务复杂度自动选择最合适的模型：

| 复杂度 | 模型 | 成本 | 适用场景 |
|-------|------|------|---------|
| 简单 | Qwen2.5-7B | ¥0.14/M tokens | 直接推荐（文档处理、视频剪辑等） |
| 中等 | GLM-4-9B | ¥0.7/M tokens | 简单工作流（数据分析、报告生成） |
| 复杂 | DeepSeek-V3 | ¥2.0/M tokens | 复杂工作流（联网搜索、多工具协作） |

**推荐模式：**
- `direct`: 直接推荐工具，无需步骤
- `workflow`: 提供完整工作流步骤

### 功能特性
1. **智能任务分类**：自动判断任务复杂度，选择最优模型
2. **三级推荐策略**：直接推荐 → 简单工作流 → 复杂工作流
3. **联网搜索增强**：复杂任务支持实时搜索最新信息（Tavily API）
4. **人机验证保护**：Cloudflare Turnstile 防止 API 滥用
5. **场景模板**：5 个预设工作流模板快速开始
6. **降级策略**：AI 失败时自动退回到关键词匹配

### 安全措施
- API Key 存储在 Cloudflare Secrets 中
- Turnstile 人机验证（生产环境强制启用）
- .dev.vars 文件已添加到 .gitignore
- 代码中无硬编码密钥
- CORS 已配置

## 监控与维护

### 查看日志
```bash
npx wrangler tail
```

### 更新部署
```bash
npx wrangler deploy
```

### 更新密钥
```bash
# 更新 SiliconFlow API Key
echo "new_api_key" | npx wrangler secret put SILICONFLOW_API_KEY

# 更新 Tavily API Key（联网搜索）
echo "new_tavily_key" | npx wrangler secret put TAVILY_API_KEY

# 更新 Turnstile Secret Key
echo "new_turnstile_secret" | npx wrangler secret put TURNSTILE_SECRET_KEY
```

## 成本估算

- **Cloudflare Workers**：免费（100k 请求/天）
- **Cloudflare Turnstile**：完全免费
- **SiliconFlow API**：
  - 简单任务：¥0.14/M tokens（Qwen 7B）
  - 中等任务：¥0.7/M tokens（GLM 4-9B）
  - 复杂任务：¥2.0/M tokens（DeepSeek-V3）
- **Tavily 搜索**：免费额度 1000 次/月
- **预估月成本**：约 ¥50-100（假设 1000 次调用/天，80% 简单任务 + 15% 中等 + 5% 复杂）
