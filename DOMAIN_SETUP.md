# 自定义域名配置指南

本指南将帮助你为 Cloudflare Worker 配置自定义域名 `x.aimake.cc`。

## 📋 前提条件

1. ✅ Worker 已成功部署（ainavapi）
2. ✅ 前端配置已更新（使用 https://x.aimake.cc）
3. ⏳ 需要在 Cloudflare Dashboard 中配置域名

## 🔧 配置步骤

### 方案一：在 Cloudflare Dashboard 中配置（推荐）

#### 步骤 1: 确认域名在 Cloudflare 中

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
2. 检查 `aimake.cc` 域名是否已添加到你的账户
   - 如果没有，需要先添加域名：点击 "Add a Site" → 输入 `aimake.cc` → 按照提示完成 DNS 迁移

#### 步骤 2: 为 Worker 添加自定义域名

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages**
2. 找到并点击你的 Worker: **ainavapi**
3. 进入 **Settings** 标签页
4. 找到 **Domains & Routes** 或 **Custom Domains** 部分
5. 点击 **Add Custom Domain** 或 **Add** 按钮
6. 输入自定义域名: `x.aimake.cc`
7. 点击 **Add Domain**

#### 步骤 3: DNS 自动配置

Cloudflare 会自动为你创建必要的 DNS 记录：
- 类型: CNAME 或 A 记录
- 名称: x
- 目标: 你的 Worker 地址
- 代理状态: 已代理（橙色云朵）

**通常不需要手动配置 DNS**，Cloudflare 会自动处理。

#### 步骤 4: 等待生效

- DNS 记录通常在 **几秒到几分钟** 内生效
- SSL 证书会自动签发（通常在 15 分钟内）

---

### 方案二：使用 Cloudflare API（高级用户）

如果你更喜欢使用命令行，可以通过 Cloudflare API 配置：

```bash
# 需要先获取 Cloudflare API Token
# 在 Dashboard 中: My Profile → API Tokens → Create Token

# 获取 Zone ID
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=aimake.cc" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"

# 获取 Worker Script ID（通常就是 Worker 名称）
# 在本例中是 "ainavapi"

# 添加自定义域名到 Worker
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/workers/services/ainavapi/environments/production/domains" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"hostname": "x.aimake.cc", "service": "ainavapi", "environment": "production"}]'
```

---

### 方案三：使用 wrangler.toml 配置 Routes（备选）

如果自定义域名不可用，可以使用路由方式：

1. 编辑 `worker/wrangler.toml`，添加：

```toml
routes = [
  { pattern = "x.aimake.cc/*", zone_name = "aimake.cc" }
]
```

2. 重新部署：

```bash
cd worker
npx wrangler deploy
```

3. 手动在 Cloudflare Dashboard 中为 `x.aimake.cc` 添加 DNS 记录

---

## ✅ 验证配置

配置完成后，使用以下方式验证：

### 1. 命令行测试

```bash
# 健康检查
curl https://x.aimake.cc/

# 推荐 API
curl -X POST https://x.aimake.cc/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "我想剪辑视频"}'

# 案例列表
curl https://x.aimake.cc/api/cases
```

### 2. 浏览器测试

打开测试页面：
```bash
# 在浏览器中访问
http://localhost:3001/test-production.html
```

点击 "运行所有测试" 按钮，查看结果。

### 3. 前端测试

```bash
# 启动前端（如果还没启动）
cd frontend
python3 -m http.server 3000

# 浏览器访问
http://localhost:3000
```

---

## 🐛 故障排除

### 问题 1: DNS_PROBE_FINISHED_NXDOMAIN

**原因**: DNS 记录未生效或不存在

**解决方案**:
1. 检查 DNS 记录: `nslookup x.aimake.cc`
2. 在 Cloudflare Dashboard 中确认 DNS 记录存在
3. 等待 DNS 传播（最多 24 小时，通常几分钟）

### 问题 2: 证书错误（SSL_ERROR）

**原因**: SSL 证书未签发或未生效

**解决方案**:
1. 在 Cloudflare Dashboard 的 SSL/TLS 设置中，确保启用了 **Full (strict)** 模式
2. 等待证书自动签发（通常 15 分钟内）
3. 检查证书状态: `openssl s_client -connect x.aimake.cc:443 -servername x.aimake.cc`

### 问题 3: Worker 未响应（502/503 错误）

**原因**: 域名绑定配置不正确

**解决方案**:
1. 重新检查 Worker 中的自定义域名配置
2. 确认 Worker 处于活动状态: `npx wrangler deployments list --name ainavapi`
3. 查看 Worker 日志: `npx wrangler tail --name ainavapi`

### 问题 4: CORS 错误

**原因**: 前端和 API 域名不同导致跨域问题

**解决方案**:
Worker 代码中已包含 CORS 处理，如果仍有问题，检查 `worker/src/index.js` 中的 CORS 配置。

---

## 📝 配置清单

完成配置后，确认以下项目：

- [ ] aimake.cc 域名已添加到 Cloudflare
- [ ] 自定义域名 x.aimake.cc 已添加到 Worker
- [ ] DNS 记录已自动创建并生效
- [ ] SSL 证书已签发
- [ ] API 端点测试通过（/、/api/recommend、/api/cases）
- [ ] 前端可以正常访问生产 API

---

## 🔗 相关链接

- Cloudflare Dashboard: https://dash.cloudflare.com
- Cloudflare Workers 文档: https://developers.cloudflare.com/workers/
- 自定义域名文档: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Cloudflare API 文档: https://developers.cloudflare.com/api/

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 Worker 日志: `npx wrangler tail --name ainavapi`
2. 检查 DNS 状态: `nslookup x.aimake.cc`
3. 测试 API 连接: `curl -v https://x.aimake.cc/`

---

**最后更新**: 2026-01-12
**Worker 名称**: ainavapi
**自定义域名**: x.aimake.cc
**生产 API**: https://x.aimake.cc
