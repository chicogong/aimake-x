<template>
  <div class="step-card" :class="{ expanded: isExpanded }">
    <!-- Header -->
    <div class="step-header" @click="toggleExpand">
      <div class="step-header-left">
        <div class="step-number">{{ step.step }}</div>
        <div class="step-title">{{ step.name }}</div>
      </div>
      <div class="expand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="step-content">
      <!-- Description -->
      <p v-if="step.description" class="step-description">{{ step.description }}</p>

      <!-- Tools -->
      <div v-if="step.tools && step.tools.length > 0" class="tools-section">
        <div class="section-title">🔧 推荐工具</div>
        <div 
          v-for="tool in step.tools" 
          :key="tool.name" 
          class="tool-item"
          @click="openUrl(tool.url)"
        >
          <div class="tool-icon">{{ tool.name.charAt(0).toUpperCase() }}</div>
          <div class="tool-info">
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-reason">{{ tool.reason }}</div>
          </div>
        </div>
      </div>

      <!-- Prompt -->
      <div v-if="step.prompt" class="prompt-section">
        <div class="section-title">💡 Prompt 模板</div>
        
        <!-- Template -->
        <div class="prompt-box">
          <div class="prompt-label">模板</div>
          <div class="prompt-text">{{ step.prompt.template }}</div>
          <button 
            class="copy-btn" 
            :class="{ copied: copiedMap['template'] }" 
            @click="copyText(step.prompt.template, 'template')"
          >
            {{ copiedMap['template'] ? '已复制' : '复制' }}
          </button>
        </div>

        <!-- Example -->
        <div v-if="step.prompt.example" class="prompt-box">
          <div class="prompt-label">示例</div>
          <div class="prompt-text">{{ step.prompt.example }}</div>
          <button 
            class="copy-btn" 
            :class="{ copied: copiedMap['example'] }" 
            @click="copyText(step.prompt.example, 'example')"
          >
            {{ copiedMap['example'] ? '已复制' : '复制' }}
          </button>
        </div>
      </div>

      <!-- Tips -->
      <div v-if="step.tips && step.tips.length > 0" class="tips-section">
        <div class="section-title">💭 操作提示</div>
        <div v-for="(tip, idx) in step.tips" :key="idx" class="tip-item">
          <div class="tip-text">{{ tip }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * StepCard - 工作流步骤卡片组件
 *
 * @component
 * @description
 * 展示工作流中的单个步骤，包含推荐工具、Prompt 模板、操作技巧等。
 * 支持展开/折叠、一键复制 Prompt 模板。
 *
 * @example
 * <StepCard :step="{
 *   step: 1,
 *   name: '脚本撰写',
 *   description: '创建视频内容大纲和脚本',
 *   tools: [{ name: 'ChatGPT', url: '...', reason: '强大的文本生成能力' }],
 *   prompt: { template: '请帮我...', example: '示例文本' },
 *   tips: ['注意事项1', '注意事项2']
 * }" />
 */

import { ref } from 'vue'

const props = defineProps({
  /**
   * 工作流步骤对象
   * @type {{
   *   step: number,
   *   name: string,
   *   description?: string,
   *   tools?: Array<{ name: string, url: string, reason: string }>,
   *   prompt?: { template: string, example?: string, variables?: string[] },
   *   tips?: string[]
   * }}
   */
  step: {
    type: Object,
    required: true
  }
})

// 展开/折叠状态
const isExpanded = ref(false)
// 复制状态映射表（用于显示"已复制"提示）
const copiedMap = ref({})

/**
 * 切换展开/折叠状态
 */
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

/**
 * 在新标签页打开工具链接
 * @param {string} url - 工具的 URL
 */
function openUrl(url) {
  window.open(url, '_blank')
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {string} key - 复制按钮的唯一标识（用于显示复制状态）
 *
 * @description
 * 使用 Clipboard API 复制文本，复制成功后显示"已复制"提示 2 秒。
 * 如果 API 不可用，提示用户手动复制。
 */
async function copyText(text, key) {
  try {
    await navigator.clipboard.writeText(text)
    copiedMap.value[key] = true
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2000) // 2 秒后恢复"复制"按钮状态
  } catch (err) {
    console.error('Copy failed:', err)
    alert('复制失败，请手动复制')
  }
}
</script>
