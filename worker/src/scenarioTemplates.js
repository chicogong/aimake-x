/**
 * 场景工作流模板库
 * 预设的典型场景，用于快速匹配用户需求
 */

export const SCENARIO_TEMPLATES = {
  // 场景1：视频制作
  "video_production": {
    task: "产品介绍视频制作",
    complexity: "complex",
    estimatedTime: "4-6小时",
    keywords: ["视频", "制作", "产品", "介绍"],
    workflow: [
      {
        step: 1,
        name: "脚本创作",
        description: "使用AI生成视频脚本，包括开场、主体和结尾",
        tools: [
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            reason: "强大的创意写作能力，适合生成故事性内容"
          },
          {
            name: "Claude",
            url: "https://claude.ai",
            reason: "长文本生成专家，可以一次性生成完整脚本"
          },
          {
            name: "豆包",
            url: "https://doubao.com",
            reason: "免费且响应快速，适合快速迭代"
          }
        ],
        prompt: {
          template: `请为「[产品名称]」创作一个 [时长] 秒的产品介绍视频脚本。

产品信息：
- 核心功能：[功能描述]
- 目标用户：[用户画像]
- 核心卖点：[卖点1]、[卖点2]、[卖点3]
- 使用场景：[场景描述]

脚本要求：
1. 开场（5秒）：用一个痛点场景吸引注意
2. 问题（10秒）：展开痛点，引发共鸣
3. 解决方案（15秒）：介绍产品核心功能和优势
4. 使用演示（20秒）：展示3个关键功能的使用场景
5. 行动号召（10秒）：引导用户下载/购买

输出格式：
- 每个镜头标注画面描述和旁白文案
- 控制在 [字数] 字以内
- 语言要简洁有力，贴近目标用户`,
          example: `请为「智能手表X1」创作一个60秒的产品介绍视频脚本。

产品信息：
- 核心功能：健康监测、运动记录、智能提醒
- 目标用户：25-40岁都市白领
- 核心卖点：全天候心率监测、50种运动模式、7天续航
- 使用场景：办公、运动、日常生活

脚本要求：（同上）`,
          variables: ["产品名称", "时长", "功能描述", "用户画像", "卖点", "场景描述", "字数"]
        },
        tips: [
          "💡 先列出3-5个核心卖点，确保脚本围绕这些展开",
          "⏱️ 按「每秒2-3个字」估算，60秒脚本约150字",
          "🎯 开场3秒内必须吸引注意，可以用「你是否遇到...」句式",
          "✍️ 多生成2-3个版本，选择最打动人的",
          "📝 脚本完成后，大声读一遍，检查是否流畅"
        ],
        tutorial: "https://x.aimake.cc/tutorial/video-script"
      },
      {
        step: 2,
        name: "视频素材生成",
        description: "使用AI工具生成视频画面或选择素材",
        tools: [
          {
            name: "Runway",
            url: "https://runwayml.com",
            reason: "AI视频生成质量最高，适合商业使用"
          },
          {
            name: "剪映",
            url: "https://capcut.cn",
            reason: "免费且功能全面，支持图文成片"
          },
          {
            name: "Midjourney",
            url: "https://midjourney.com",
            reason: "生成高质量静态图片，可用于视频素材"
          }
        ],
        prompt: {
          template: `方案A - Runway视频生成：
根据以下场景描述生成视频：
[粘贴脚本中的画面描述]

风格要求：
- 画面风格：[简约科技/温馨生活/商务专业/年轻活力]
- 色调：[明亮/暗黑/暖色/冷色]
- 镜头运动：[固定/缓慢推进/快速切换]
- 时长：每段5-8秒

方案B - 剪映图文成片：
1. 打开剪映 → 图文成片
2. 粘贴脚本文案
3. 选择模板风格：[商务/科技/时尚/清新]
4. 自动生成视频
5. 调整配乐和转场

方案C - 素材混剪：
从免费素材网站下载：
- Pexels：https://pexels.com
- Pixabay：https://pixabay.com
搜索关键词：[产品类型] + [使用场景]`,
          example: `Runway视频生成示例：
「智能手表特写，显示心率监测界面，科技感蓝色背景，缓慢旋转展示」
风格：简约科技
色调：蓝白为主
时长：8秒`,
          variables: ["画面描述", "风格", "色调", "镜头运动", "时长", "产品类型", "场景"]
        },
        tips: [
          "💰 预算充足选Runway（$95/月），预算有限用剪映（免费）",
          "🎨 如果AI生成效果不理想，可用Midjourney生成图片再导入剪映",
          "⚡ 剪映的「图文成片」功能可以快速生成初版，再手动调整",
          "📐 视频尺寸建议：横屏16:9（1920x1080）或竖屏9:16（1080x1920）",
          "🎬 每段素材控制在5-10秒，避免画面停留过久"
        ],
        tutorial: "https://x.aimake.cc/tutorial/video-generation"
      },
      {
        step: 3,
        name: "视频剪辑与优化",
        description: "添加字幕、音效、转场，输出最终视频",
        tools: [
          {
            name: "剪映",
            url: "https://capcut.cn",
            reason: "自动字幕识别准确率高，素材库丰富"
          },
          {
            name: "必剪",
            url: "https://bcut.bilibili.com",
            reason: "B站官方工具，适合UP主使用"
          }
        ],
        prompt: {
          template: `（此步骤主要是手动操作，以下是操作清单）

✅ 剪辑清单：
1. 导入素材
   - 视频片段 + 背景音乐 + 配音（可选）

2. 自动生成字幕
   - 剪映：点击「文字」→「识别字幕」
   - 选择字幕样式：推荐「描边+阴影」提高可读性
   - 校对字幕：修正识别错误

3. 添加背景音乐
   - 从剪映素材库选择版权音乐
   - 音量调节：背景音乐 -20dB，确保不盖过配音
   - 音乐淡入淡出：开头和结尾各1秒

4. 添加转场效果
   - 推荐：叠化、闪白（不要用太花哨的）
   - 每2-3个镜头添加1次转场
   - 转场时长：0.5秒

5. 调色与滤镜
   - 统一色调：提高饱和度10%、对比度5%
   - 可选滤镜：「明亮」或「清新」

6. 导出设置
   - 分辨率：1080P
   - 帧率：30fps（流畅）或 60fps（超清）
   - 码率：中高（保证质量）`,
          example: "",
          variables: []
        },
        tips: [
          "🎵 背景音乐选择技巧：开头用节奏感强的，中间用舒缓的，结尾用高潮的",
          "📝 字幕样式要统一，建议全程使用同一套模板",
          "⏱️ 导出前完整预览3遍，检查：字幕错误、音画不同步、转场生硬",
          "💾 保存项目文件，方便后续修改",
          "📤 导出时选择「抖音」或「YouTube」预设，自动匹配最佳参数"
        ],
        tutorial: "https://x.aimake.cc/tutorial/video-editing"
      }
    ],
    mermaid: `graph LR
  A[📝 脚本创作<br/>ChatGPT/Claude] --> B[🎬 视频生成<br/>Runway/剪映]
  B --> C[✂️ 剪辑优化<br/>剪映/必剪]
  C --> D[✅ 发布]

  style A fill:#E3F2FD
  style B fill:#FFF3E0
  style C fill:#F3E5F5
  style D fill:#E8F5E9`
  },

  // 场景2：代码开发
  "code_development": {
    task: "网站开发",
    complexity: "complex",
    estimatedTime: "2-4天",
    keywords: ["代码", "开发", "网站", "编程"],
    workflow: [
      {
        step: 1,
        name: "需求设计与架构",
        description: "使用AI生成技术方案和架构设计",
        tools: [
          {
            name: "Claude",
            url: "https://claude.ai",
            reason: "代码理解和架构设计能力强"
          },
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            reason: "技术栈推荐和最佳实践"
          }
        ],
        prompt: {
          template: `我要开发一个 [网站类型] 网站，请帮我设计技术方案。

需求描述：
- 核心功能：[功能1]、[功能2]、[功能3]
- 用户规模：预计 [用户数] 用户
- 特殊需求：[性能要求/安全要求/其他]

请提供：
1. 推荐的技术栈（前端+后端+数据库）
2. 项目目录结构
3. 核心功能的实现思路
4. 开发优先级排序
5. 预估开发时间

要求：
- 优先选择主流、成熟的技术
- 考虑开发效率和长期维护
- 给出具体的框架版本号`,
          example: `我要开发一个博客网站，请帮我设计技术方案。

需求描述：
- 核心功能：文章发布、评论系统、用户登录
- 用户规模：预计500-1000用户
- 特殊需求：SEO友好、响应式设计

（接上述要求）`,
          variables: ["网站类型", "功能", "用户数", "需求"]
        },
        tips: [
          "📚 让AI对比2-3个技术方案，选择最适合你的",
          "⚖️ 新手优先选：Next.js + Vercel（前端）或 Django（全栈）",
          "🎯 确定MVP（最小可行产品）功能，先做核心，后扩展",
          "📖 要求AI生成学习资源链接，边学边做",
          "🔧 保存AI生成的架构图和说明，作为开发参考"
        ],
        tutorial: "https://x.aimake.cc/tutorial/project-planning"
      },
      {
        step: 2,
        name: "代码生成与开发",
        description: "使用AI编程工具快速生成代码",
        tools: [
          {
            name: "Cursor",
            url: "https://cursor.sh",
            reason: "最强AI编程助手，理解上下文能力强"
          },
          {
            name: "GitHub Copilot",
            url: "https://github.com/features/copilot",
            reason: "GitHub官方，代码补全准确"
          },
          {
            name: "通义灵码",
            url: "https://tongyi.aliyun.com/lingma",
            reason: "免费，支持中文注释"
          }
        ],
        prompt: {
          template: `# 在Cursor中使用的Prompt模板

## 生成组件：
Cmd+K (Mac) 或 Ctrl+K (Windows)
「创建一个 [组件名称] 组件，实现以下功能：
- [功能1]
- [功能2]
使用 [技术栈]，遵循最佳实践」

## 解释代码：
Cmd+L → 选中代码
「解释这段代码的作用和工作原理」

## 修复Bug：
Cmd+L → 粘贴报错信息
「这个错误如何修复？请给出完整代码」

## 优化代码：
选中代码 → Cmd+K
「优化这段代码：
1. 提高性能
2. 增强可读性
3. 遵循 [语言] 最佳实践」

## 写测试：
Cmd+K
「为 [函数名] 函数编写单元测试，使用 Jest 框架」`,
          example: `Cursor示例：
Cmd+K
「创建一个博客文章列表组件，实现以下功能：
- 分页显示文章（每页10篇）
- 显示标题、摘要、作者、发布时间
- 点击跳转到文章详情
使用 React + TypeScript，遵循最佳实践」`,
          variables: ["组件名称", "功能", "技术栈", "语言", "函数名"]
        },
        tips: [
          "⚡ Cursor快捷键：Cmd+K生成代码、Cmd+L对话、Tab接受建议",
          "📝 写详细的注释和需求，AI生成的代码质量更高",
          "🔄 生成代码后立即运行测试，发现问题及时修复",
          "💡 遇到不懂的代码，选中后按Cmd+L让AI解释",
          "📦 将常用的代码片段保存为「Custom Instructions」"
        ],
        tutorial: "https://x.aimake.cc/tutorial/ai-coding"
      },
      {
        step: 3,
        name: "调试部署",
        description: "修复Bug并部署到生产环境",
        tools: [
          {
            name: "Cursor",
            url: "https://cursor.sh",
            reason: "AI辅助调试，快速定位问题"
          },
          {
            name: "Vercel",
            url: "https://vercel.com",
            reason: "一键部署，自动HTTPS和CDN"
          },
          {
            name: "Cloudflare",
            url: "https://cloudflare.com",
            reason: "免费的全球CDN和DDoS防护"
          }
        ],
        prompt: {
          template: `## 调试Bug：
我遇到以下错误：
\`\`\`
[错误信息]
\`\`\`

相关代码：
\`\`\`[语言]
[代码片段]
\`\`\`

请帮我：
1. 分析错误原因
2. 给出修复方案
3. 解释为什么会出现这个问题
4. 如何避免类似错误

## 性能优化：
请分析以下代码的性能问题：
\`\`\`[语言]
[代码]
\`\`\`

优化目标：
- [加载速度/内存占用/响应时间]
- 提升 [具体指标]

## 部署检查：
项目准备部署，请检查：
1. 环境变量配置是否完整
2. 生产环境构建是否成功
3. 安全性检查（API密钥、CORS等）
4. 性能优化建议`,
          example: `调试示例：
我遇到以下错误：
\`\`\`
TypeError: Cannot read property 'map' of undefined
at PostList.jsx:15
\`\`\`

相关代码：
\`\`\`javascript
const posts = data.posts;
return posts.map(post => <PostCard key={post.id} {...post} />)
\`\`\`

（接上述要求）`,
          variables: ["错误信息", "代码片段", "语言", "具体指标"]
        },
        tips: [
          "🐛 调试时提供完整的错误堆栈和相关代码，AI定位更准确",
          "🚀 Vercel部署三步骤：连接GitHub → 导入项目 → 自动部署",
          "🔒 生产环境必须设置环境变量（不要硬编码密钥）",
          "📊 部署后使用Lighthouse检测性能和SEO",
          "🔄 设置自动部署：每次git push自动重新部署"
        ],
        tutorial: "https://x.aimake.cc/tutorial/deployment"
      }
    ],
    mermaid: `graph LR
  A[📋 需求设计<br/>Claude/ChatGPT] --> B[💻 代码生成<br/>Cursor/Copilot]
  B --> C[🐛 调试优化<br/>Cursor]
  C --> D[🚀 部署上线<br/>Vercel/CF]

  style A fill:#E1F5FE
  style B fill:#F3E5F5
  style C fill:#FFF3E0
  style D fill:#E8F5E9`
  },

  // 场景3：文档处理（合同审查）
  "document_processing": {
    task: "合同条款审查",
    complexity: "moderate",
    estimatedTime: "30分钟-1小时",
    keywords: ["合同", "文档", "审查", "法律"],
    workflow: [
      {
        step: 1,
        name: "文档上传与识别",
        description: "将合同文件转换为可编辑文本",
        tools: [
          {
            name: "Kimi",
            url: "https://kimi.moonshot.cn",
            reason: "支持20万字长文本，直接拖拽PDF"
          },
          {
            name: "WPS AI",
            url: "https://wps.cn",
            reason: "原生支持Word/PDF，无需转换"
          }
        ],
        prompt: {
          template: `已上传合同文件：[文件名]

请帮我：
1. 提取合同的基本信息
   - 合同类型
   - 签约方
   - 合同金额
   - 有效期限
   - 签署日期

2. 列出所有条款目录
   - 按章节编号列出
   - 标注重要条款（权利义务、违约责任、争议解决）

3. 识别特殊条款
   - 独家条款
   - 竞业限制
   - 保密协议
   - 知识产权归属`,
          example: `（直接拖拽PDF到Kimi对话框）

已上传：《软件开发服务合同.pdf》

请帮我：（接上述要求）`,
          variables: ["文件名"]
        },
        tips: [
          "📄 Kimi支持直接拖拽PDF/Word，无需提前转换格式",
          "🔍 如果合同是扫描件，先用WPS的OCR功能转文字",
          "📋 要求AI生成目录结构，方便后续检索",
          "⚠️ 特别关注：违约责任、赔偿条款、终止条件",
          "💡 一次上传多个合同可以做对比分析"
        ],
        tutorial: "https://x.aimake.cc/tutorial/document-upload"
      },
      {
        step: 2,
        name: "条款分析与风险识别",
        description: "AI分析合同内容，标注风险点",
        tools: [
          {
            name: "Kimi",
            url: "https://kimi.moonshot.cn",
            reason: "长文本分析能力强，可以完整理解合同"
          },
          {
            name: "法狗狗",
            url: "https://lawgou.com",
            reason: "专业法律AI，提供法条依据"
          }
        ],
        prompt: {
          template: `请从以下角度分析这份合同：

1. 权利义务平衡性
   - 甲方权利和义务
   - 乙方权利和义务
   - 是否存在明显不对等

2. 风险条款识别（标注⚠️）
   - 对我方不利的条款
   - 责任承担不明确的条款
   - 可能引发争议的条款
   - 违约赔偿是否过高

3. 缺失条款提醒
   - 常见合同应有但缺失的条款
   - 建议补充的内容

4. 改进建议
   - 每个风险点给出修改方案
   - 提供修改后的条款文本

5. 法律依据
   - 引用相关法律法规
   - 说明为什么这些条款有风险

我的角色：[甲方/乙方]
合同类型：[类型]`,
          example: `请分析这份《软件开发服务合同》

我的角色：乙方（开发方）
合同类型：技术服务合同

（接上述分析要求）`,
          variables: ["角色", "合同类型"]
        },
        tips: [
          "⚖️ 明确你的角色（甲方/乙方），AI会站在你的立场分析",
          "🔴 重点关注：违约责任、知识产权归属、付款条款",
          "📊 要求AI按风险等级排序（高中低），优先处理高风险项",
          "💰 特别注意：赔偿金额、违约金比例是否合理",
          "📝 将AI的分析结果保存为Word文档，供律师审阅"
        ],
        tutorial: "https://x.aimake.cc/tutorial/contract-analysis"
      },
      {
        step: 3,
        name: "修改建议与版本对比",
        description: "生成修改意见并对比合同版本",
        tools: [
          {
            name: "Kimi",
            url: "https://kimi.moonshot.cn",
            reason: "可以对比两份合同的差异"
          },
          {
            name: "WPS AI",
            url: "https://wps.cn",
            reason: "Word智能修订功能"
          }
        ],
        prompt: {
          template: `基于风险分析，请生成修改建议：

1. 对每个风险点，提供2-3个修改方案
   - 方案A：完全规避风险（可能对方不接受）
   - 方案B：平衡双方利益（推荐）
   - 方案C：最低限度修改（保底方案）

2. 修改后的完整条款文本
   - 突出显示修改部分
   - 说明修改理由

3. 谈判话术
   - 如何向对方解释修改必要性
   - 可能的让步空间

4. 版本对比（如有多个版本）
   上传旧版合同，生成对比表：
   | 条款 | 旧版本 | 新版本 | 变化说明 |`,
          example: `基于刚才的风险分析，生成修改建议：

重点条款：
- 第5条 违约责任（违约金过高）
- 第8条 知识产权归属（不明确）
- 第12条 争议解决（仲裁地对我方不利）

（接上述要求）`,
          variables: []
        },
        tips: [
          "📝 修改建议要具体可执行，直接给出修改后的条款文本",
          "🤝 谈判时不要一次性提所有修改，分优先级逐步推进",
          "📊 使用WPS的「修订模式」，清晰标记所有改动",
          "⚡ 如果对方发来新版本，立即用AI对比差异",
          "✅ 最终版本确定后，让AI生成《合同修改说明》备查"
        ],
        tutorial: "https://x.aimake.cc/tutorial/contract-revision"
      }
    ],
    mermaid: `graph LR
  A[📄 上传识别<br/>Kimi/WPS] --> B[🔍 风险分析<br/>Kimi/法狗狗]
  B --> C[✍️ 修改建议<br/>Kimi/WPS]
  C --> D[✅ 版本确定]

  style A fill:#E8EAF6
  style B fill:#FCE4EC
  style C fill:#FFF9C4
  style D fill:#E8F5E9`
  },

  // 场景4：会议记录
  "meeting_transcription": {
    task: "会议录音转写与总结",
    complexity: "simple",
    estimatedTime: "10-20分钟",
    keywords: ["会议", "录音", "转写", "总结"],
    workflow: [
      {
        step: 1,
        name: "录音转文字",
        description: "将会议录音转换为文字稿",
        tools: [
          {
            name: "通义听悟",
            url: "https://tingwu.aliyun.com",
            reason: "免费额度大，准确率高，支持多人对话"
          },
          {
            name: "飞书AI",
            url: "https://feishu.cn",
            reason: "集成在飞书会议中，自动转写"
          },
          {
            name: "讯飞听见",
            url: "https://iflyrec.com",
            reason: "支持方言识别，适合非标准普通话"
          }
        ],
        prompt: {
          template: `（通义听悟操作步骤）

1. 上传录音文件
   - 支持格式：MP3、WAV、M4A、MP4
   - 最大时长：5小时
   - 建议音质：清晰，无严重噪音

2. 设置转写参数
   - 语言：中文/英文/中英混合
   - 场景：会议/访谈/课程/其他
   - 说话人：自动区分/手动指定人数

3. 开始转写
   - 等待时间：通常为录音时长的1/3
   - 例如：30分钟录音约需10分钟

4. 优化文本
   - 自动添加标点符号
   - 区分不同说话人（用颜色标记）
   - 修正明显的识别错误`,
          example: `上传文件：「产品评审会议_20260112.mp3」（45分钟）

设置：
- 语言：中文
- 场景：会议
- 说话人：5人

预计10-15分钟完成转写`,
          variables: []
        },
        tips: [
          "🎤 录音技巧：手机放置在会议桌中央，避免距离太远",
          "🔇 录音前提醒参会人员，避免多人同时说话",
          "⏱️ 如果会议超过2小时，建议分段录音后分别转写",
          "✏️ 转写完成后，快速浏览一遍，修正明显错误（人名、专业术语）",
          "💾 通义听悟会保存历史记录，可随时查看"
        ],
        tutorial: "https://x.aimake.cc/tutorial/transcription"
      },
      {
        step: 2,
        name: "会议纪要生成",
        description: "AI总结会议内容，提取关键信息",
        tools: [
          {
            name: "通义听悟",
            url: "https://tingwu.aliyun.com",
            reason: "内置智能总结功能"
          },
          {
            name: "Kimi",
            url: "https://kimi.moonshot.cn",
            reason: "长文本总结能力强"
          },
          {
            name: "飞书AI",
            url: "https://feishu.cn",
            reason: "可直接生成待办任务"
          }
        ],
        prompt: {
          template: `请根据以下会议内容生成会议纪要：

[粘贴会议转写文本]

会议信息：
- 会议主题：[主题]
- 参会人员：[人员列表]
- 会议时间：[时间]

请生成：

## 一、会议概要（50字以内）
[一句话总结会议主题和结论]

## 二、讨论要点
[按议题分类整理]
1. 议题A
   - 讨论内容：
   - 结论：

2. 议题B
   - 讨论内容：
   - 结论：

## 三、决策事项
[明确的决定和行动计划]
1. 决策1 - 负责人：XX - 截止时间：XX
2. 决策2 - 负责人：XX - 截止时间：XX

## 四、待办任务
[按负责人分配]
- 张三：
  - [ ] 任务1 - 截止：1月20日
  - [ ] 任务2 - 截止：1月25日
- 李四：
  - [ ] 任务3 - 截止：1月22日

## 五、遗留问题
[需要进一步确认或讨论的]
1. 问题1
2. 问题2`,
          example: `会议信息：
- 主题：Q1产品规划评审
- 参会人：张三(产品)、李四(开发)、王五(设计)、赵六(运营)
- 时间：2026年1月12日 14:00-15:30

（粘贴转写文本后，接上述要求）`,
          variables: ["主题", "人员列表", "时间"]
        },
        tips: [
          "📝 让AI按「讨论-决策-任务」结构整理，清晰明了",
          "👥 明确任务负责人和截止时间，避免事后扯皮",
          "⚡ 会议结束后立即生成纪要，趁记忆清晰时补充细节",
          "📧 纪要生成后，通过飞书/邮件发送给所有参会人",
          "🔄 下次会议前回顾上次纪要，跟进任务完成情况"
        ],
        tutorial: "https://x.aimake.cc/tutorial/meeting-minutes"
      }
    ],
    mermaid: `graph LR
  A[🎤 录音转写<br/>通义听悟] --> B[📝 纪要生成<br/>通义听悟/Kimi]
  B --> C[📧 分发纪要<br/>飞书/邮件]
  C --> D[✅ 任务跟进]

  style A fill:#E3F2FD
  style B fill:#FFF3E0
  style C fill:#F3E5F5
  style D fill:#E8F5E9`
  },

  // 场景5：数据分析
  "data_analysis": {
    task: "Excel数据处理与分析",
    complexity: "moderate",
    estimatedTime: "1-2小时",
    keywords: ["数据", "分析", "Excel", "表格"],
    workflow: [
      {
        step: 1,
        name: "数据清洗与整理",
        description: "处理原始数据，统一格式",
        tools: [
          {
            name: "ChatExcel",
            url: "https://chatexcel.com",
            reason: "AI对话式操作Excel，无需公式"
          },
          {
            name: "WPS AI",
            url: "https://wps.cn",
            reason: "原生Excel环境，AI辅助"
          },
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            reason: "可以生成Excel公式和VBA脚本"
          }
        ],
        prompt: {
          template: `我有一份Excel数据，需要清洗整理。

数据说明：
- 数据来源：[来源]
- 数据量：[行数] 行 × [列数] 列
- 主要字段：[字段列表]

清洗需求：
1. 删除重复数据
   - 按 [字段名] 去重

2. 格式统一
   - 日期格式统一为：YYYY-MM-DD
   - 金额格式：保留2位小数
   - 文本格式：去除前后空格

3. 数据补全
   - [字段A] 空值填充：[规则]
   - [字段B] 空值填充：[规则]

4. 异常值处理
   - [字段C] 超过 [数值] 的标记为异常
   - [字段D] 为负数的删除

请给出具体操作步骤或公式`,
          example: `数据说明：
- 来源：销售系统导出
- 数据量：5000行 × 12列
- 主要字段：订单号、日期、客户名、金额、状态

清洗需求：
1. 删除重复数据（按订单号去重）
2. 日期统一为 YYYY-MM-DD
3. 金额保留2位小数
4. 状态字段：将"已完成""完成""成功"统一为"已完成"`,
          variables: ["来源", "行数", "列数", "字段列表", "字段名", "规则", "数值"]
        },
        tips: [
          "🧹 清洗前先复制一份原始数据，避免误操作无法恢复",
          "📊 使用ChatExcel：直接说「删除A列的重复值」即可，无需记公式",
          "🔍 异常值可以用条件格式高亮显示，方便人工核查",
          "⚡ 批量替换文本：Ctrl+H 或让AI生成SUBSTITUTE公式",
          "💡 如果数据量超过10万行，建议用Python处理（让ChatGPT写脚本）"
        ],
        tutorial: "https://x.aimake.cc/tutorial/data-cleaning"
      },
      {
        step: 2,
        name: "数据分析与可视化",
        description: "统计分析，生成图表",
        tools: [
          {
            name: "ChatExcel",
            url: "https://chatexcel.com",
            reason: "自然语言生成透视表和图表"
          },
          {
            name: "WPS AI",
            url: "https://wps.cn",
            reason: "AI生成图表，自动选择合适类型"
          },
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            reason: "生成复杂公式和数据分析脚本"
          }
        ],
        prompt: {
          template: `基于清洗后的数据，进行以下分析：

1. 描述性统计
   - [字段A]：求和、平均值、最大值、最小值
   - [字段B]：计数、去重计数
   - [字段C]：中位数、标准差

2. 分组统计
   - 按 [维度1] 分组，统计 [指标]
   - 按 [维度2] 分组，统计 [指标]

3. 趋势分析
   - [指标] 随时间的变化趋势
   - 同比/环比增长率

4. 关联分析
   - [字段X] 与 [字段Y] 的相关性
   - 交叉分析表

请生成：
- 数据透视表
- 合适的图表（柱状图/折线图/饼图）
- 分析结论（用简单语言描述发现）`,
          example: `分析需求：
1. 销售总额、平均单价、订单数量
2. 按月份统计销售额
3. 按客户类型统计订单量
4. 销售额随时间变化趋势
5. TOP 10 客户销售额占比

（接上述要求）`,
          variables: ["字段", "维度", "指标"]
        },
        tips: [
          "📊 图表选择原则：比较用柱状图、趋势用折线图、占比用饼图",
          "🎨 图表美化：统一配色、添加数据标签、清晰的标题",
          "📈 对比分析：同期、同比、环比，选择合适的对比维度",
          "💡 让ChatExcel自动推荐分析角度：「帮我发现这份数据的关键洞察」",
          "📝 分析结论要用业务语言，而不是统计术语"
        ],
        tutorial: "https://x.aimake.cc/tutorial/data-visualization"
      },
      {
        step: 3,
        name: "报告生成与展示",
        description: "生成数据分析报告",
        tools: [
          {
            name: "WPS AI",
            url: "https://wps.cn",
            reason: "AI生成PPT报告"
          },
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            reason: "撰写报告文字内容"
          },
          {
            name: "飞书AI",
            url: "https://feishu.cn",
            reason: "团队协作，在线报告"
          }
        ],
        prompt: {
          template: `基于数据分析结果，生成分析报告。

报告要求：
- 报告主题：[主题]
- 目标受众：[高层/业务部门/技术团队]
- 报告长度：[页数] 页

报告结构：
## 第1页：封面
- 标题、时间、制作人

## 第2页：核心发现（重点）
- 3-5个关键结论
- 用数字和图表直观呈现

## 第3-N页：详细分析
- 每页一个分析主题
- 图表 + 文字说明
- 突出异常值和趋势

## 最后一页：建议与行动计划
- 基于分析的3-5条建议
- 可执行的下一步行动

语言风格：
- 简洁专业，避免术语堆砌
- 用业务语言，而非统计术语
- 突出"所以呢"（So What）- 数据背后的意义`,
          example: `报告主题：2026年Q1销售数据分析
目标受众：销售VP和市场总监
报告长度：8页

核心发现：
1. Q1销售额1250万，同比增长35%
2. 新客户占比45%，老客户复购率65%
3. TOP10客户贡献48%销售额，集中度较高
4. 3月销售明显下滑，需关注

（接上述结构要求）`,
          variables: ["主题", "受众", "页数"]
        },
        tips: [
          "🎯 报告第一页（核心发现）最重要，决定受众是否继续看",
          "📊 每页PPT只放1-2个图表，不要信息过载",
          "🔢 用数字说话：具体的百分比、金额、增长率",
          "💡 每个图表配一句话结论，告诉受众「该看什么」",
          "📧 报告发出前，让1-2个同事预览，确保逻辑清晰"
        ],
        tutorial: "https://x.aimake.cc/tutorial/data-report"
      }
    ],
    mermaid: `graph LR
  A[🧹 数据清洗<br/>ChatExcel/WPS] --> B[📊 分析可视化<br/>ChatExcel/WPS]
  B --> C[📝 报告生成<br/>WPS/ChatGPT]
  C --> D[📧 分享报告]

  style A fill:#E1F5FE
  style B fill:#FFF3E0
  style C fill:#F3E5F5
  style D fill:#E8F5E9`
  }
};

// 根据关键词匹配场景
export function matchScenario(keywords) {
  for (const [scenarioId, scenario] of Object.entries(SCENARIO_TEMPLATES)) {
    // 检查是否有关键词匹配
    const matchCount = scenario.keywords.filter(kw =>
      keywords.some(userKw => userKw.includes(kw) || kw.includes(userKw))
    ).length;

    if (matchCount > 0) {
      return {
        scenarioId,
        ...scenario,
        matchScore: matchCount / scenario.keywords.length
      };
    }
  }

  return null;
}

// 获取所有场景列表
export function getAllScenarios() {
  return Object.entries(SCENARIO_TEMPLATES).map(([id, scenario]) => ({
    id,
    task: scenario.task,
    complexity: scenario.complexity,
    estimatedTime: scenario.estimatedTime,
    keywords: scenario.keywords
  }));
}

export default {
  SCENARIO_TEMPLATES,
  matchScenario,
  getAllScenarios
};
