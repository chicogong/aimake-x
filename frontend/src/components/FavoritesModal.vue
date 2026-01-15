<template>
  <div class="modal active" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>我的收藏</h2>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <p v-if="favorites.length === 0" class="empty-favorites">暂无收藏内容</p>
        <div v-else class="results-grid">
          <ProductCard 
            v-for="item in favorites" 
            :key="item.id" 
            :product="item.data"
            :is-favorite="true"
            @toggle-favorite="$emit('toggle', item.data)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  favorites: {
    type: Array,
    required: true
  }
})

defineEmits(['close', 'toggle'])
</script>
