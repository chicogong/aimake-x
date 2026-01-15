// 产品库（核心推荐）
export const PRODUCTS = {
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
export const MODELS = {
  // 免费模型（优先使用）
  'Qwen/Qwen2.5-7B-Instruct': { cost: 0, speed: 'fast', capability: 'simple' },
  'THUDM/glm-4-9b-chat': { cost: 0, speed: 'fast', capability: 'moderate' },
  // 付费模型（性能更好）
  'deepseek-ai/DeepSeek-V3': { cost: 1.33, speed: 'medium', capability: 'complex' }
};
