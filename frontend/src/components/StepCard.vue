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
import { ref } from 'vue'

const props = defineProps({
  step: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(false)
const copiedMap = ref({})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function openUrl(url) {
  window.open(url, '_blank')
}

async function copyText(text, key) {
  try {
    await navigator.clipboard.writeText(text)
    copiedMap.value[key] = true
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
    alert('复制失败，请手动复制')
  }
}
</script>
