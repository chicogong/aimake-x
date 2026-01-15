/**
 * 产品库和模型配置
 *
 * @file worker/src/data.js
 * @description 定义 AI 工具产品库和三模型架构的模型配置
 */

/**
 * @typedef {Object} Product
 * @property {string} name - 产品名称
 * @property {string} url - 产品官网链接
 * @property {string} desc - 产品功能描述
 */

/**
 * 产品库：按任务类型分类的 AI 工具推荐数据库
 *
 * @type {Object.<string, Product[]>}
 *
 * @description
 * 核心推荐数据源，包含 50+ 款 AI 工具。
 * 关键词（key）会被用于：
 * 1. AI 系统提示词中的候选关键词
 * 2. 降级方案的关键词匹配
 *
 * 支持的任务类型：
 * - 文档、表格、视频、音频、会议
 * - 合同、法律、代码、写作、绘画
 */
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

/**
 * @typedef {Object} ModelConfig
 * @property {number} cost - 模型成本（人民币/百万 tokens）
 * @property {string} speed - 推理速度：'fast' | 'medium' | 'slow'
 * @property {string} capability - 能力等级：'simple' | 'moderate' | 'complex'
 */

/**
 * 三模型架构配置：根据任务复杂度智能选择模型
 *
 * @type {Object.<string, ModelConfig>}
 *
 * @description
 * 分级推荐策略，平衡成本和质量：
 * - Qwen 7B (¥0.14/M tokens): 简单任务、快速分类
 * - GLM 4-9B (¥0.7/M tokens): 中等复杂度、简单工作流
 * - DeepSeek-V3 (¥2.0/M tokens): 复杂工作流 + 联网搜索
 *
 * 预估分布：80% simple, 15% moderate, 5% complex
 * 平均成本：约 ¥0.3/M tokens
 */
export const MODELS = {
  // 轻量模型（用于简单任务和分类）
  'Qwen/Qwen2.5-7B-Instruct': { cost: 0.14, speed: 'fast', capability: 'simple' },
  // 中等模型（用于中等复杂度任务）
  'THUDM/glm-4-9b-chat': { cost: 0.7, speed: 'fast', capability: 'moderate' },
  // 强力模型（用于复杂工作流生成）
  'deepseek-ai/DeepSeek-V3': { cost: 2.0, speed: 'medium', capability: 'complex' }
};
