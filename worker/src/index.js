import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateWorkflowWithWebSearch, shouldEnableWebSearch } from './webSearch.js';
import { matchScenario, getAllScenarios } from './scenarioTemplates.js';
import { PRODUCTS, MODELS } from './data.js';

const app = new Hono();

app.use('/*', cors());

/**
 * 验证 Cloudflare Turnstile 人机验证 token
 *
 * @param {string} token - 前端 Turnstile 组件生成的验证 token
 * @param {string} secret - Turnstile Secret Key（从环境变量获取）
 * @param {string} ip - 客户端 IP 地址
 * @returns {Promise<boolean>} 验证是否成功
 *
 * @description
 * Turnstile 是 Cloudflare 提供的免费人机验证服务，用于防止 API 滥用。
 * Token 是一次性的，验证后即失效。
 */
async function verifyTurnstile(token, secret, ip) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secret,
        response: token,
        remoteip: ip
      })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile 验证失败:', error);
    return false;
  }
}

// 产品库和模型配置已移至 ./data.js

// 工作流 JSON Schema
const WORKFLOW_SCHEMA = {
  type: "object",
  required: ["task", "complexity", "workflow"],
  properties: {
    task: { type: "string" },
    complexity: { enum: ["simple", "moderate", "complex"] },
    estimatedTime: { type: "string" },
    workflow: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["step", "name", "tools", "prompt"],
        properties: {
          step: { type: "integer", minimum: 1 },
          name: { type: "string" },
          description: { type: "string" },
          tools: {
            type: "array",
            maxItems: 3,
            items: {
              type: "object",
              required: ["name", "url", "reason"],
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          prompt: {
            type: "object",
            required: ["template"],
            properties: {
              template: { type: "string" },
              example: { type: "string" },
              variables: { type: "array", items: { type: "string" } }
            }
          },
          tips: { type: "array", items: { type: "string" } }
        }
      }
    },
    mermaid: { type: "string" }
  }
};

/**
 * 调用 SiliconFlow API 进行 LLM 推理
 *
 * @param {Array<{role: string, content: string}>} messages - 对话消息数组
 * @param {string} model - 模型名称（如 'Qwen/Qwen2.5-7B-Instruct'）
 * @param {Object} env - Cloudflare Workers 环境变量对象
 * @param {Object} options - 可选配置
 * @param {number} [options.max_tokens=2000] - 最大生成 token 数（默认 2000）
 * @param {number} [options.temperature=0.3] - 采样温度，控制随机性（0-1，默认 0.3）
 * @param {boolean} [options.json_mode=false] - 是否强制 JSON 输出格式
 * @returns {Promise<string>} AI 生成的文本内容
 * @throws {Error} 当 API Key 未配置或 API 调用失败时抛出错误
 *
 * @description
 * 封装 SiliconFlow 的 OpenAI 兼容 API 调用。
 * max_tokens 限制：
 * - 300: 简单分类任务（analyzeTaskComplexity）
 * - 2000: 常规推理任务（默认值）
 * - 4000: 复杂工作流生成
 */
async function callSiliconFlow(messages, model, env, options = {}) {
  const apiKey = env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error('未配置 SILICONFLOW_API_KEY');
  }

  const requestBody = {
    model,
    messages,
    max_tokens: options.max_tokens || 2000, // 默认 2000 tokens，适合大多数推理任务
    temperature: options.temperature || 0.3,  // 低温度确保输出稳定性
    ...options
  };

  // 如果需要JSON输出，添加response_format
  if (options.json_mode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败 (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * 阶段 1：分析任务复杂度（三模型架构的第一阶段）
 *
 * @param {string} query - 用户输入的任务描述
 * @param {Object} env - 环境变量对象
 * @returns {Promise<Object>} 包含复杂度、任务类型、关键词等信息的对象
 * @returns {string} return.complexity - 任务复杂度：'simple' | 'moderate' | 'complex'
 * @returns {string} return.taskType - 任务类型（如"文档"、"视频"等）
 * @returns {Array<string>} return.keywords - 匹配的关键词数组
 * @returns {string} return.reasoning - AI 的分析理由
 * @returns {boolean} return.needsWebSearch - 是否需要联网搜索
 *
 * @description
 * 使用 Qwen 7B 模型进行任务复杂度分类，成本低（¥0.14/M tokens）。
 * 根据分类结果决定后续使用哪个模型：
 * - simple: 继续使用 Qwen 7B 直接推荐
 * - moderate: 升级到 GLM 4-9B 生成简单工作流
 * - complex: 升级到 DeepSeek-V3 + 联网搜索
 *
 * max_tokens=300 足够返回 JSON 分类结果
 */
async function analyzeTaskComplexity(query, env) {
  const messages = [
    {
      role: 'system',
      content: `你是任务分析专家。分析用户任务的复杂度。

复杂度定义：
- simple: 单一工具可完成（如"找个AI写作工具"、"推荐视频剪辑软件"）
- moderate: 需要2-3个工具配合（如"制作营销视频"、"处理会议录音"）
- complex: 需要完整工作流程（如"从0到1开发网站"、"制作产品介绍视频"）

任务类型：文档、表格、视频、音频、会议、合同、法律、代码、写作、绘画

必须返回JSON格式（不要markdown代码块）：
{
  "complexity": "simple|moderate|complex",
  "taskType": "任务类型",
  "keywords": ["关键词1", "关键词2"],
  "reasoning": "分析理由",
  "needsWebSearch": true或false
}`
    },
    {
      role: 'user',
      content: query
    }
  ];

  try {
    // 使用 Qwen 7B 模型进行快速分类（成本最低）
    const result = await callSiliconFlow(
      messages,
      'Qwen/Qwen2.5-7B-Instruct',
      env,
      { json_mode: true, max_tokens: 300, temperature: 0.2 }
    );

    return JSON.parse(result);
  } catch (error) {
    console.error('任务分析失败，使用降级方案:', error);
    // 降级：简单关键词匹配
    const taskType = Object.keys(PRODUCTS).find(k => query.includes(k)) || '写作';
    return {
      complexity: 'simple',
      taskType,
      keywords: [taskType],
      reasoning: '使用关键词匹配',
      needsWebSearch: false
    };
  }
}

// 阶段2：生成工作流（复杂任务）
async function generateWorkflow(query, analysis, env, maxRetries = 3) {
  const messages = [
    {
      role: 'system',
      content: `你是AI工作流专家。根据任务生成详细的执行流程。

产品库：
${JSON.stringify(PRODUCTS, null, 2)}

必须返回JSON格式（不要markdown代码块）：
{
  "task": "任务名称",
  "complexity": "${analysis.complexity}",
  "estimatedTime": "预估时间（如 2-4小时）",
  "workflow": [
    {
      "step": 1,
      "name": "步骤名称",
      "description": "步骤说明",
      "tools": [
        {
          "name": "工具名（必须从产品库中选择）",
          "url": "工具链接",
          "reason": "推荐理由"
        }
      ],
      "prompt": {
        "template": "Prompt模板（用[变量]标记）",
        "example": "具体示例",
        "variables": ["变量1", "变量2"]
      },
      "tips": ["操作建议1", "操作建议2"]
    }
  ],
  "mermaid": "graph LR\\n  A[步骤1] --> B[步骤2]"
}

要求：
1. 工具推荐必须从产品库中选择，URL必须正确
2. Prompt模板要具体实用，包含详细的提示词
3. 每个步骤不超过3个工具推荐
4. 生成简洁的Mermaid流程图`
    },
    {
      role: 'user',
      content: `任务：${query}

分析结果：
- 复杂度：${analysis.complexity}
- 任务类型：${analysis.taskType}
- 关键词：${analysis.keywords.join('、')}

请生成完整的工作流JSON。`
    }
  ];

  // 重试逻辑
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 根据复杂度选择模型
      const model = analysis.complexity === 'complex'
        ? 'deepseek-ai/DeepSeek-V3'  // 复杂任务用最强模型
        : 'THUDM/glm-4-9b-chat';      // 中等任务用免费模型

      const result = await callSiliconFlow(
        messages,
        model,
        env,
        {
          json_mode: true,
          max_tokens: 4000,
          temperature: 0.3 + (attempt - 1) * 0.1  // 逐步提高随机性
        }
      );

      const workflow = JSON.parse(result);

      // 简单验证
      if (workflow.workflow && Array.isArray(workflow.workflow) && workflow.workflow.length > 0) {
        return workflow;
      }

      console.log(`第${attempt}次生成格式不完整，重试...`);
    } catch (error) {
      console.error(`第${attempt}次生成失败:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 指数退避
      }
    }
  }

  // 所有重试失败，返回降级方案
  throw new Error('工作流生成失败，请重试');
}

// 简单推荐（simple任务）
function getSimpleRecommendation(analysis) {
  const keywords = analysis.keywords || [analysis.taskType];
  const recommendations = [];
  const matchedKeys = [];

  // 尝试匹配产品库中的关键词
  for (const keyword of keywords) {
    // 1. 精确匹配
    if (PRODUCTS[keyword]) {
      matchedKeys.push(keyword);
      recommendations.push(...PRODUCTS[keyword].slice(0, 3));
      continue;
    }

    // 2. 模糊匹配（关键词包含产品库中的key）
    for (const [productKey, products] of Object.entries(PRODUCTS)) {
      if (keyword.includes(productKey) || productKey.includes(keyword)) {
        matchedKeys.push(productKey);
        recommendations.push(...products.slice(0, 3));
        break;
      }
    }
  }

  // 3. 如果还是没匹配到，使用 taskType
  if (recommendations.length === 0 && PRODUCTS[analysis.taskType]) {
    matchedKeys.push(analysis.taskType);
    recommendations.push(...PRODUCTS[analysis.taskType].slice(0, 3));
  }

  // 去重
  const unique = Array.from(
    new Map(recommendations.map(item => [item.name, item])).values()
  ).slice(0, 3);

  // 如果仍然为空，返回默认推荐
  if (unique.length === 0) {
    return {
      query: analysis.taskType,
      complexity: 'simple',
      matchedKeywords: [],
      recommendations: [
        { name: '豆包', url: 'https://doubao.com', desc: '免费的日常对话、文案生成' },
        { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: '长文本处理、文档分析' },
        { name: 'ChatGPT', url: 'https://chat.openai.com', desc: '强大的对话和创作能力' }
      ],
      message: '为您推荐通用AI工具'
    };
  }

  return {
    query: analysis.taskType,
    complexity: 'simple',
    matchedKeywords: matchedKeys,
    recommendations: unique,
    message: '为您推荐以下工具'
  };
}



// 智能推荐 API（V2 - 三模型架构）
app.post('/api/recommend', async (c) => {
  try {
    // Turnstile 验证
    const turnstileToken = c.req.header('CF-Turnstile-Token');
    const turnstileSecret = c.env.TURNSTILE_SECRET_KEY;

    // 只在生产环境且配置了密钥时启用验证
    if (c.env.ENVIRONMENT === 'production' && turnstileSecret) {
      if (!turnstileToken) {
        return c.json({ error: '缺少人机验证' }, 403);
      }

      const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
      const isValid = await verifyTurnstile(turnstileToken, turnstileSecret, clientIP);

      if (!isValid) {
        return c.json({ error: '人机验证失败，请刷新页面重试' }, 403);
      }
    }

    const { query } = await c.req.json();

    if (!query || query.trim().length === 0) {
      return c.json({ error: '请输入任务描述' }, 400);
    }

    // 阶段1：任务分析
    console.log('[阶段1] 分析任务复杂度...');
    const analysis = await analyzeTaskComplexity(query, c.env);
    console.log('[阶段1] 分析结果:', analysis);

    // 根据复杂度选择不同的处理方式
    if (analysis.complexity === 'simple') {
      // 简单任务：直接推荐工具
      console.log('[简单任务] 直接推荐工具');
      const result = getSimpleRecommendation(analysis);
      return c.json({
        ...result,
        mode: 'simple',
        timestamp: Date.now()
      });
    }

    // 中等/复杂任务：生成工作流
    console.log('[阶段2] 生成工作流...');

    // 优先尝试匹配场景模板
    const matchedScenario = matchScenario(analysis.keywords);
    let workflow;

    if (matchedScenario && matchedScenario.matchScore >= 0.5) {
      console.log(`[阶段2] 使用场景模板: ${matchedScenario.task} (匹配度: ${(matchedScenario.matchScore * 100).toFixed(0)}%)`);
      workflow = {
        ...matchedScenario,
        source: 'template'  // 标记来源
      };
    } else {
      console.log('[阶段2] 使用AI生成工作流...');
      workflow = await generateWorkflow(query, analysis, c.env);
      workflow.source = 'ai';  // 标记来源
    }

    console.log('[阶段2] 工作流准备完成');

    // 阶段3：联网搜索（可选）
    let webSearchData = null;
    if (shouldEnableWebSearch(query, analysis) && c.env.ZHIPU_API_KEY) {
      try {
        console.log('[阶段3] 尝试联网搜索...');
        webSearchData = await generateWorkflowWithWebSearch(query, analysis, c.env);
        if (webSearchData) {
          console.log('[阶段3] 联网搜索成功，找到', webSearchData.tools.length, '个工具');
        }
      } catch (error) {
        console.error('[阶段3] 联网搜索失败（不影响主流程）:', error);
      }
    }

    return c.json({
      ...workflow,
      mode: 'workflow',
      analysis,
      webSearch: webSearchData,  // 可能为null
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('推荐失败:', error);

    // 降级：返回默认推荐
    return c.json({
      query: '默认推荐',
      complexity: 'simple',
      recommendations: [
        { name: '豆包', url: 'https://doubao.com', desc: '免费的日常对话、文案生成' },
        { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: '长文本处理、文档分析' },
        { name: 'ChatGPT', url: 'https://chat.openai.com', desc: '强大的对话和创作能力' }
      ],
      error: error.message,
      mode: 'fallback',
      timestamp: Date.now()
    });
  }
});

// 场景模板列表（新增）
app.get('/api/scenarios', (c) => {
  const scenarios = getAllScenarios();
  return c.json({
    scenarios,
    total: scenarios.length,
    message: '所有预设场景模板'
  });
});

// 案例列表
app.get('/api/cases', (c) => {
  const cases = [
    {
      id: 'gov-doc',
      title: '政府公文对比',
      desc: '领导改了第 5 稿，秘书要手动核对差异',
      solution: 'AI 2 秒标记所有修改点',
      products: ['Kimi', 'WPS AI']
    },
    {
      id: 'invoice',
      title: '财务发票识别',
      desc: '每月 200+ 张发票手动录入 Excel',
      solution: '拍照即录入，AI 识别率 98%',
      products: ['通义听悟', 'WPS AI']
    },
    {
      id: 'video',
      title: '视频剪辑字幕',
      desc: '视频需要添加字幕和配音',
      solution: 'AI 自动生成字幕和配音',
      products: ['剪映', '必剪']
    },
    {
      id: 'meeting',
      title: '会议记录整理',
      desc: '会议录音需要转写成文字并总结',
      solution: 'AI 自动转写并生成会议纪要',
      products: ['飞书 AI', '通义听悟']
    },
    {
      id: 'contract',
      title: '合同条款审查',
      desc: '20 页合同需要找出关键条款和风险点',
      solution: 'AI 提取关键信息并标注风险',
      products: ['Kimi', '法狗狗']
    }
  ];

  return c.json({ cases });
});

export default app;
