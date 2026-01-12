/**
 * 智谱AI Web Search 集成
 * 文档: https://docs.bigmodel.cn/cn/guide/tools/web-search
 */

// 调用智谱AI联网搜索
export async function zhipuWebSearch(query, apiKey, options = {}) {
  if (!apiKey) {
    throw new Error('未配置 ZHIPU_API_KEY');
  }

  const requestBody = {
    model: options.model || "glm-4-plus",  // 支持联网搜索的模型
    messages: [
      {
        role: "user",
        content: query
      }
    ],
    tools: [
      {
        type: "web_search",
        web_search: {
          enable: true,                    // 启用联网搜索
          search_result: true              // 返回搜索结果
        }
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 2000
  };

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`智谱AI API 调用失败 (${response.status}): ${error}`);
  }

  const data = await response.json();

  // 提取搜索结果和回答
  const message = data.choices[0].message;
  const webSearchResults = message.tool_calls
    ? message.tool_calls.filter(t => t.type === 'web_search')
    : [];

  return {
    answer: message.content,
    webSearchResults,
    usage: data.usage
  };
}

// 增强工作流生成（带联网搜索）
export async function generateWorkflowWithWebSearch(query, analysis, env, options = {}) {
  const { needsWebSearch } = analysis;

  // 如果不需要联网搜索，直接返回null
  if (!needsWebSearch) {
    return null;
  }

  try {
    // 构建联网搜索查询
    const searchQuery = `最新的 ${analysis.taskType} AI工具推荐 2026年`;

    console.log('[联网搜索] 查询:', searchQuery);

    const result = await zhipuWebSearch(
      searchQuery,
      env.ZHIPU_API_KEY,
      { max_tokens: 1500 }
    );

    console.log('[联网搜索] 成功，找到结果数:', result.webSearchResults.length);

    // 提取工具推荐
    const tools = extractToolsFromSearchResults(result.answer);

    return {
      searchQuery,
      answer: result.answer,
      tools,
      sources: result.webSearchResults.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.substring(0, 150)
      }))
    };
  } catch (error) {
    console.error('[联网搜索] 失败:', error);
    return null;  // 搜索失败不影响主流程
  }
}

// 从搜索结果中提取工具信息
function extractToolsFromSearchResults(text) {
  const tools = [];

  // 简单的正则提取（可以后续优化）
  const lines = text.split('\n');
  for (const line of lines) {
    // 匹配类似 "工具名 - 描述" 或 "1. 工具名：描述" 的格式
    const match = line.match(/(?:\d+\.\s*)?([^-：:]+)[\s-：:]+(.+)/);
    if (match && match[1].length < 30) {
      tools.push({
        name: match[1].trim(),
        description: match[2].trim()
      });
    }
  }

  return tools.slice(0, 5);  // 最多返回5个
}

// 判断是否需要联网搜索
export function shouldEnableWebSearch(query, analysis) {
  // 需要联网搜索的情况：
  // 1. 用户明确提到"最新"、"2026"、"最近"等时间相关词
  // 2. 复杂任务且可能需要最新工具信息
  // 3. 分析结果标记需要联网

  const timeKeywords = ['最新', '最近', '2026', '最好的', '推荐', '哪个好'];
  const hasTimeKeyword = timeKeywords.some(kw => query.includes(kw));

  return (
    analysis.needsWebSearch === true ||
    hasTimeKeyword ||
    analysis.complexity === 'complex'
  );
}

export default {
  zhipuWebSearch,
  generateWorkflowWithWebSearch,
  shouldEnableWebSearch
};
