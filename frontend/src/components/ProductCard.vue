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
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-favorite'])

const hostname = computed(() => {
  try {
    return new URL(props.product.url).hostname
  } catch {
    return props.product.url
  }
})

function openUrl() {
  window.open(props.product.url, '_blank')
}

function toggleFavorite() {
  emit('toggle-favorite', props.product)
}
</script>
