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
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V2.5
```

### 3. 本地测试

```bash
cd worker
npx wrangler dev --port 8787
```

### 4. 部署到 Cloudflare

```bash
# 设置生产环境密钥
echo "your_api_key" | npx wrangler secret put SILICONFLOW_API_KEY

# 部署
npx wrangler deploy
```

部署后会得到一个 URL：`https://<worker-name>.<account>.workers.dev`

## API 端点

### 1. 健康检查
```bash
GET /
```

响应示例：
```json
{
  "status": "ok",
  "message": "AI导航 - API 服务运行中",
  "version": "1.0.0"
}
```

### 2. 智能推荐
```bash
POST /api/recommend
Content-Type: application/json

{
  "query": "我想处理一份合同文档"
}
```

响应示例：
```json
{
  "query": "我想处理一份合同文档",
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

### 3. 案例列表
```bash
GET /api/cases
```

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

### 使用的模型
- **模型**：DeepSeek-V2.5
- **平台**：SiliconFlow
- **成本**：¥0.14/M tokens

### 功能特性
1. **AI 智能分析**：使用 DeepSeek 模型分析用户任务
2. **关键词匹配**：AI 失败时自动降级到关键词匹配
3. **产品推荐**：推荐最相关的 AI 产品
4. **案例展示**：典型应用场景

### 安全措施
- API Key 存储在 Cloudflare Secrets 中
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
echo "new_api_key" | npx wrangler secret put SILICONFLOW_API_KEY
```

## 成本估算

- **Cloudflare Workers**：免费（100k 请求/天）
- **SiliconFlow API**：约 ¥0.14/M tokens
- **预估月成本**：约 ¥50（1000 次调用/天）
