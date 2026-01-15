<template>
  <div v-if="history.length > 0" class="history-container">
    <span class="history-label">最近搜索:</span>
    <div class="history-tags">
      <span 
        v-for="item in history" 
        :key="item" 
        class="history-tag"
        @click="$emit('search', item)"
      >
        {{ item }}
      </span>
    </div>
    <span class="clear-history" title="清空历史" @click="$emit('clear')">×</span>
  </div>
</template>

<script setup>
/**
 * HistoryTags - 搜索历史标签组件
 *
 * @component
 * @description
 * 展示用户最近的搜索历史，支持点击快速重新搜索。
 * 当历史记录为空时，组件不会显示。
 *
 * @example
 * <HistoryTags
 *   :history="['剪辑视频', '写作', '代码生成']"
 *   @search="handleSearch"
 *   @clear="clearHistory"
 * />
 */

defineProps({
  /**
   * 搜索历史数组
   * @type {string[]}
   */
  history: {
    type: Array,
    default: () => []
  }
})

/**
 * 组件事件
 * @event search - 点击历史标签时触发，参数为搜索文本
 * @event clear - 点击清空按钮时触发
 */
defineEmits(['search', 'clear'])
</script>
