import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
    { name: '通义灵码', url: 'https://tongyi.aliyun.com/lingma', desc: '免费的代码补全和生成' },
    { name: 'Cursor', url: 'https://cursor.sh', desc: '最强 AI 代码编辑器' }
  ],
  '写作': [
    { name: '豆包', url: 'https://doubao.com', desc: '免费的文案生成、日常对话' },
    { name: '讯飞星火', url: 'https://xinghuo.xfyun.cn', desc: '专业写作、教育辅导' }
  ],
  '绘画': [
    { name: '文心一格', url: 'https://yige.baidu.com', desc: '免费 AI 绘画' },
    { name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', desc: '商业设计、电商图' }
  ]
};

// 调用 SiliconFlow API
async function callAI(prompt, env) {
  const apiKey = env.SILICONFLOW_API_KEY;
  const model = env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V2.5';

  if (!apiKey) {
    throw new Error('未配置 SILICONFLOW_API_KEY');
  }

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一个 AI 产品推荐助手。根据用户的任务描述，从以下关键词中选择最相关的 1-2 个：文档、表格、视频、音频、会议、合同、法律、代码、写作、绘画。只返回关键词，用逗号分隔，不要其他内容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`API 调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// 健康检查
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'AI导航 - API 服务运行中',
    version: '1.0.0'
  });
});

// 智能推荐 API
app.post('/api/recommend', async (c) => {
  try {
    const { query } = await c.req.json();

    if (!query) {
      return c.json({ error: '请输入任务描述' }, 400);
    }

    let recommendations = [];
    let matchedKeywords = [];

    // 尝试使用 AI 分析
    try {
      const aiResult = await callAI(query, c.env);
      const keywords = aiResult.split(/[,，、]/).map(k => k.trim()).filter(k => k);

      // 根据 AI 返回的关键词匹配产品
      for (const keyword of keywords) {
        if (PRODUCTS[keyword]) {
          matchedKeywords.push(keyword);
          recommendations.push(...PRODUCTS[keyword].slice(0, 2));
        }
      }
    } catch (error) {
      console.error('AI 分析失败，使用关键词匹配:', error);

      // 降级方案：简单关键词匹配
      for (const [keyword, products] of Object.entries(PRODUCTS)) {
        if (query.includes(keyword)) {
          matchedKeywords.push(keyword);
          recommendations.push(...products.slice(0, 2));
          break;
        }
      }
    }

    // 去重
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.name, item])).values()
    ).slice(0, 3);

    // 默认推荐
    if (uniqueRecommendations.length === 0) {
      uniqueRecommendations.push(
        { name: '豆包', url: 'https://doubao.com', desc: '免费的日常对话、文案生成' },
        { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: '长文本处理、文档分析' },
        { name: 'WPS AI', url: 'https://wps.cn', desc: '办公文档智能处理' }
      );
    }

    return c.json({
      query,
      matchedKeywords,
      recommendations: uniqueRecommendations,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('推荐失败:', error);
    return c.json({ error: error.message }, 500);
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
