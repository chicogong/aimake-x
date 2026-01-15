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
defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

defineEmits(['search', 'clear'])
</script>
