import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTML_CONTENT } from './frontend.js';

const app = new Hono();

app.use('/*', cors());

// 产品库（核心推荐）
const PRODUCTS = {
  '文档': [
    { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: '长文本处理、文档分析，支持20万字' },
    { name: 'WPS AI', url: 'https://wps.cn', desc: 'Word/Excel/PPT 智能处理' },
    { name: '飞书 AI', url: 'https://feishu.cn', desc: '团队协作、会议纪要' }
  ],
  '表格': [
    { name: 'ChatExcel', url: 'https://chatexcel.com', desc: 'Excel 数据处理专家' },
    { name: 'WPS AI', url: 'https://wps.cn', desc: 'Excel 智能分析' }
  ],
  '视频': [
    { name: '剪映', url: 'https://capcut.cn', desc: '视频剪辑、AI字幕、配音' },
    { name: 'Runway', url: 'https://runwayml.com', desc: '视频生成、AI特效' },
    { name: '必剪', url: 'https://bcut.bilibili.com', desc: 'B站视频创作工具' }
  ],
  '音频': [
    { name: '通义听悟', url: 'https://tingwu.aliyun.com', desc: '音视频转写、智能总结，免费额度大' },
    { name: '讯飞听见', url: 'https://iflyrec.com', desc: '语音转文字，准确率高' }
  ],
  '会议': [
    { name: '飞书 AI', url: 'https://feishu.cn', desc: '会议纪要、智能总结' },
    { name: '通义听悟', url: 'https://tingwu.aliyun.com', desc: '会议录音转写' }
  ],
  '合同': [
    { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: '长文本分析，支持合同对比' },
    { name: '法狗狗', url: 'https://lawgou.com', desc: '专业合同审查、法律咨询' }
  ],
  '法律': [
    { name: '法狗狗', url: 'https://lawgou.com', desc: '合同审查、法律咨询' },
    { name: '无讼', url: 'https://itslaw.com', desc: '法律检索、案例分析' }
  ],
  '代码': [
    { name: 'Cursor', url: 'https://cursor.sh', desc: '最强 AI 代码编辑器' },
    { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', desc: 'GitHub 官方代码助手' },
    { name: '通义灵码', url: 'https://tongyi.aliyun.com/lingma', desc: '免费的代码补全和生成' }
  ],
  '写作': [
    { name: 'ChatGPT', url: 'https://chat.openai.com', desc: '强大的对话和创作能力' },
    { name: 'Claude', url: 'https://claude.ai', desc: '长文本写作专家' },
    { name: '豆包', url: 'https://doubao.com', desc: '免费的文案生成' }
  ],
  '绘画': [
    { name: 'Midjourney', url: 'https://midjourney.com', desc: '艺术级 AI 绘画' },
    { name: '文心一格', url: 'https://yige.baidu.com', desc: '免费 AI 绘画' },
    { name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', desc: '商业设计、电商图' }
  ]
};

// 模型配置
const MODELS = {
  // 免费模型（优先使用）
  'Qwen/Qwen2.5-7B-Instruct': { cost: 0, speed: 'fast', capability: 'simple' },
  'THUDM/glm-4-9b-chat': { cost: 0, speed: 'fast', capability: 'moderate' },
  // 付费模型（性能更好）
  'deepseek-ai/DeepSeek-V3': { cost: 1.33, speed: 'medium', capability: 'complex' }
};

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

// 调用 SiliconFlow API
async function callSiliconFlow(messages, model, env, options = {}) {
  const apiKey = env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error('未配置 SILICONFLOW_API_KEY');
  }

  const requestBody = {
    model,
    messages,
    max_tokens: options.max_tokens || 2000,
    temperature: options.temperature || 0.3,
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

// 阶段1：任务复杂度分析
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
    // 使用免费的 Qwen 7B 模型
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

  for (const keyword of keywords) {
    if (PRODUCTS[keyword]) {
      recommendations.push(...PRODUCTS[keyword].slice(0, 3));
    }
  }

  // 去重
  const unique = Array.from(
    new Map(recommendations.map(item => [item.name, item])).values()
  ).slice(0, 3);

  return {
    query: analysis.taskType,
    complexity: 'simple',
    matchedKeywords: keywords,
    recommendations: unique,
    message: '为您推荐以下工具'
  };
}

// 健康检查
app.get('/', (c) => {
  return c.html(HTML_CONTENT);
});

// 智能推荐 API（V2 - 三模型架构）
app.post('/api/recommend', async (c) => {
  try {
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
    const workflow = await generateWorkflow(query, analysis, c.env);
    console.log('[阶段2] 工作流生成成功');

    return c.json({
      ...workflow,
      mode: 'workflow',
      analysis,
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
