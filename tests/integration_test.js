#!/usr/bin/env node

/**
 * 集成测试脚本
 * 测试所有 API 端点和功能
 */

const API_BASE = 'http://localhost:8788';

// 测试用例
const testCases = [
  {
    name: '简单任务 - 视频剪辑',
    query: '推荐一个视频剪辑工具',
    expectedMode: 'simple',
    expectedComplexity: 'simple'
  },
  {
    name: '中等任务 - 会议记录',
    query: '会议录音转文字并总结',
    expectedMode: 'workflow',
    expectedComplexity: 'moderate'
  },
  {
    name: '复杂任务 - 产品视频',
    query: '制作一个产品介绍视频',
    expectedMode: 'workflow',
    expectedComplexity: 'complex'
  },
  {
    name: '复杂任务 - 网站开发',
    query: '开发一个博客网站',
    expectedMode: 'workflow',
    expectedComplexity: 'complex'
  },
  {
    name: '中等任务 - 数据分析',
    query: '分析Excel销售数据并生成可视化报告',
    expectedMode: 'workflow',
    expectedComplexity: 'moderate'
  }
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// 测试单个用例
async function testRecommend(testCase) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testCase.query })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    // 验证响应
    const checks = [];

    if (data.mode === testCase.expectedMode) {
      checks.push('✓ mode正确');
    } else {
      checks.push(`✗ mode错误 (期望: ${testCase.expectedMode}, 实际: ${data.mode})`);
    }

    if (testCase.expectedMode === 'simple') {
      if (data.recommendations && data.recommendations.length > 0) {
        checks.push(`✓ 推荐了${data.recommendations.length}个工具`);
      } else {
        checks.push('✗ 缺少推荐结果');
      }
    } else {
      if (data.workflow && data.workflow.length > 0) {
        checks.push(`✓ 生成了${data.workflow.length}步工作流`);

        // 检查每个步骤的完整性
        let allStepsValid = true;
        for (const step of data.workflow) {
          if (!step.tools || step.tools.length === 0) {
            checks.push(`✗ 步骤${step.step}缺少工具推荐`);
            allStepsValid = false;
          }
          if (!step.prompt || !step.prompt.template) {
            checks.push(`✗ 步骤${step.step}缺少Prompt模板`);
            allStepsValid = false;
          }
        }
        if (allStepsValid) {
          checks.push('✓ 所有步骤结构完整');
        }
      } else {
        checks.push('✗ 缺少工作流');
      }

      if (data.mermaid) {
        checks.push('✓ 包含流程图');
      }
    }

    const allPassed = checks.every(c => c.startsWith('✓'));

    if (allPassed) {
      log(colors.green, `✓ ${testCase.name} (${duration}ms)`);
    } else {
      log(colors.yellow, `⚠ ${testCase.name} (${duration}ms)`);
    }

    checks.forEach(check => {
      if (check.startsWith('✓')) {
        log(colors.gray, `  ${check}`);
      } else {
        log(colors.red, `  ${check}`);
      }
    });

    return allPassed;

  } catch (error) {
    const duration = Date.now() - startTime;
    log(colors.red, `✗ ${testCase.name} (${duration}ms)`);
    log(colors.red, `  错误: ${error.message}`);
    return false;
  }
}

// 测试其他端点
async function testOtherEndpoints() {
  log(colors.blue, '\n测试其他端点:');

  // 测试前端页面
  try {
    const response = await fetch(`${API_BASE}/`);
    const html = await response.text();
    if (response.ok && html.includes('AI导航')) {
      log(colors.green, '✓ 前端页面 (/)');
    } else {
      log(colors.red, '✗ 前端页面加载失败');
    }
  } catch (error) {
    log(colors.red, `✗ 前端页面错误: ${error.message}`);
  }

  // 测试场景列表
  try {
    const response = await fetch(`${API_BASE}/api/scenarios`);
    const data = await response.json();
    if (data.scenarios && data.scenarios.length > 0) {
      log(colors.green, `✓ 场景列表 (/api/scenarios) - ${data.scenarios.length}个场景`);
    } else {
      log(colors.red, '✗ 场景列表为空');
    }
  } catch (error) {
    log(colors.red, `✗ 场景列表错误: ${error.message}`);
  }

  // 测试案例列表
  try {
    const response = await fetch(`${API_BASE}/api/cases`);
    const data = await response.json();
    if (data.cases && data.cases.length > 0) {
      log(colors.green, `✓ 案例列表 (/api/cases) - ${data.cases.length}个案例`);
    } else {
      log(colors.red, '✗ 案例列表为空');
    }
  } catch (error) {
    log(colors.red, `✗ 案例列表错误: ${error.message}`);
  }
}

// 主测试流程
async function runTests() {
  log(colors.blue, '========================================');
  log(colors.blue, '🧪 AI导航 - 集成测试');
  log(colors.blue, '========================================\n');
  log(colors.gray, `API地址: ${API_BASE}\n`);

  // 检查服务是否运行
  try {
    const response = await fetch(`${API_BASE}/`);
    if (!response.ok) {
      log(colors.red, '✗ Worker服务未启动或无法访问');
      log(colors.yellow, '请先运行: cd worker && npx wrangler dev --local --port 8788');
      process.exit(1);
    }
  } catch (error) {
    log(colors.red, '✗ Worker服务未启动或无法访问');
    log(colors.yellow, '请先运行: cd worker && npx wrangler dev --local --port 8788');
    process.exit(1);
  }

  log(colors.blue, '测试推荐API:');

  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    const result = await testRecommend(testCase);
    if (result) passed++;
    console.log(''); // 空行
  }

  await testOtherEndpoints();

  // 测试总结
  log(colors.blue, '\n========================================');
  log(colors.blue, '📊 测试总结');
  log(colors.blue, '========================================');

  const passRate = ((passed / total) * 100).toFixed(0);

  if (passed === total) {
    log(colors.green, `✓ 全部通过: ${passed}/${total} (${passRate}%)`);
    process.exit(0);
  } else {
    log(colors.yellow, `⚠ 部分通过: ${passed}/${total} (${passRate}%)`);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  log(colors.red, '\n✗ 测试失败:', error);
  process.exit(1);
});
