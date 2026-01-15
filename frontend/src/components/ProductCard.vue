<template>
  <div class="product-card" @click="openUrl">
    <button 
      class="favorite-btn" 
      :class="{ active: isFavorite }" 
      title="收藏" 
      @click.stop="toggleFavorite"
    >
      ❤
    </button>

    <div class="product-header">
      <div class="product-icon">{{ product.name.charAt(0).toUpperCase() }}</div>
      <span class="product-badge">推荐</span>
    </div>

    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-desc">{{ product.desc }}</p>

    <div class="product-footer">
      <span class="product-url">{{ hostname }}</span>
      <a :href="product.url" target="_blank" class="product-link" @click.stop>
        立即使用 →
      </a>
    </div>
  </div>
</template>

<script setup>
/**
 * ProductCard - AI 工具产品推荐卡片组件
 *
 * @component
 * @description
 * 展示单个 AI 工具的卡片，支持收藏功能和一键跳转。
 * 点击卡片主体或"立即使用"按钮都会在新标签页打开产品链接。
 *
 * @example
 * <ProductCard
 *   :product="{ name: 'ChatGPT', url: 'https://chat.openai.com', desc: '强大的AI对话' }"
 *   :is-favorite="true"
 *   @toggle-favorite="handleFavorite"
 * />
 */

import { computed } from 'vue'

const props = defineProps({
  /**
   * 产品信息对象
   * @type {{ name: string, url: string, desc: string }}
   */
  product: {
    type: Object,
    required: true
  },
  /**
   * 是否已收藏
   */
  isFavorite: {
    type: Boolean,
    default: false
  }
})

/**
 * 组件事件
 * @event toggle-favorite - 切换收藏状态时触发
 * @param {Object} product - 被收藏/取消收藏的产品对象
 */
const emit = defineEmits(['toggle-favorite'])

/**
 * 从 URL 中提取主机名用于显示
 * @type {ComputedRef<string>}
 */
const hostname = computed(() => {
  try {
    return new URL(props.product.url).hostname
  } catch {
    // URL 解析失败时返回原始 URL
    return props.product.url
  }
})

/**
 * 在新标签页打开产品链接
 */
function openUrl() {
  window.open(props.product.url, '_blank')
}

/**
 * 切换收藏状态
 */
function toggleFavorite() {
  emit('toggle-favorite', props.product)
}
</script>
