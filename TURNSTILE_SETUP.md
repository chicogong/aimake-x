# Cloudflare Turnstile 人机验证设置指南

## 什么是 Turnstile？

Cloudflare Turnstile 是一个免费的、用户友好的人机验证系统，用于替代传统 CAPTCHA。它能有效防止机器人滥用，同时提供更好的用户体验。

## 为什么需要人机验证？

- 防止 API 滥用和爬虫
- 保护 AI API 配额不被恶意消耗
- 限制自动化攻击和垃圾请求
- 完全免费，无使用限制

## 设置步骤

### 1. 创建 Turnstile 站点

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧菜单 **Turnstile**
3. 点击 **Add Site**
4. 填写配置：
   - **Site name**: AI导航
   - **Domain**: `x.aimake.cc` (你的域名)
   - **Widget Mode**: Managed (推荐)
   - **Pre-Clearance**: 关闭
5. 点击 **Create**

### 2. 获取密钥

创建成功后会显示两个密钥：

- **Site Key** (公开): 如 `1x00000000000000000000AA`
- **Secret Key** (私密): 如 `1x0000000000000000000000000000000AA`

⚠️ **重要**: Secret Key 必须保密，不要提交到代码仓库！

### 3. 配置前端

1. **引入脚本**:
   在 `<head>` 中引入 Cloudflare 脚本：
   ```html
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
   ```

2. **添加组件**:
   找到 Turnstile widget 部分，替换 `data-sitekey`:
   ```html
   <div class="cf-turnstile"
        data-sitekey="YOUR_SITE_KEY_HERE"
        data-callback="onTurnstileSuccess"
        data-theme="dark"></div>
   ```

3. **添加回调函数**:
   在 `<script>` 标签中添加回调逻辑（处理验证成功后的 Token）：
   ```javascript
   function onTurnstileSuccess(token) {
       console.log("Turnstile verified, token:", token);
       // 将 token 发送到后端之前，可以将其存储或直接用于 API 请求头
       // 后端 API 读取 header: 'CF-Turnstile-Token'
   }
   ```

### 4. 配置后端

设置 Cloudflare Workers Secret（生产环境）:

```bash
cd worker
echo "YOUR_SECRET_KEY_HERE" | npx wrangler secret put TURNSTILE_SECRET_KEY
```

本地开发环境（可选）:

在本地开发时（通常 `ENVIRONMENT` 不是 `production`），建议使用 Cloudflare 提供的**测试密钥**，以避免生产环境数据的干扰。

在 `worker/.dev.vars` 文件中添加（此文件已被 gitignore）:

```ini
# Cloudflare Turnstile Testing Secret Key (Always passes)
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### 5. 部署

```bash
cd worker
npx wrangler deploy
```

## 验证是否生效

1. 访问 https://x.aimake.cc/
2. 在搜索框输入查询
3. 应该看到底部出现 Cloudflare 人机验证组件
4. 验证通过后才能提交搜索请求

## 测试模式

如果想在本地测试，可以使用 Cloudflare 提供的测试密钥：

**测试 Site Key (总是通过):**
```
1x00000000000000000000AA
```

**测试 Secret Key:**
```
1x0000000000000000000000000000000AA
```

⚠️ 注意：测试密钥仅用于开发，生产环境必须使用真实密钥！

## 工作原理

1. **前端**: 用户访问页面时，Turnstile 会在后台分析行为
2. **验证**: 大多数情况下自动通过，少数情况需要用户点击
3. **Token**: 验证通过后生成一次性 token
4. **请求**: 前端将 token 通过 header `CF-Turnstile-Token` 发送给后端
5. **校验**: 后端调用 Turnstile API 验证 token 真实性（注意：通常仅在 `ENVIRONMENT=production` 时开启强制验证）
6. **重置**: 每次请求后 token 失效，需要重新验证

## 常见问题

### Q: 本地开发时验证总是失败？

A: 本地开发默认跳过验证（ENVIRONMENT != "production"）。如需测试，请：
1. 使用测试密钥
2. 或在 `.dev.vars` 中设置 `ENVIRONMENT=production`

### Q: 如何禁用 Turnstile？

A: 不设置 `TURNSTILE_SECRET_KEY` 即可自动禁用验证（仅在生产环境需要时启用）

### Q: 验证失败率高怎么办？

A: 在 Turnstile Dashboard 中调整 Widget Mode:
- **Managed**: 自适应，推荐
- **Non-Interactive**: 完全无感知，但可能误判
- **Invisible**: 隐藏，后台验证

### Q: 影响用户体验吗？

A: Turnstile 大多数情况下无感知，远好于传统 CAPTCHA。只有检测到可疑行为时才会要求交互。

## 监控和分析

在 Cloudflare Dashboard -> Turnstile 中可以查看：
- 总验证次数
- 成功率
- 被拦截的请求
- 流量趋势

## 更多信息

- [Turnstile 官方文档](https://developers.cloudflare.com/turnstile/)
- [API 参考](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
