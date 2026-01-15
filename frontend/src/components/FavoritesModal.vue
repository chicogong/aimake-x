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
/**
 * FavoritesModal - 收藏夹弹窗组件
 *
 * @component
 * @description
 * 以模态弹窗形式展示用户收藏的 AI 工具列表。
 * 支持取消收藏操作，点击遮罩层或关闭按钮可关闭弹窗。
 *
 * @example
 * <FavoritesModal
 *   :favorites="[{ id: '1', data: { name: 'ChatGPT', ... }, type: 'product', timestamp: 123456 }]"
 *   @close="closeFavorites"
 *   @toggle="handleToggleFavorite"
 * />
 */

import ProductCard from './ProductCard.vue'

defineProps({
  /**
   * 收藏列表数组
   * @type {Array<{ id: string, data: Object, type: string, timestamp: number }>}
   */
  favorites: {
    type: Array,
    required: true
  }
})

/**
 * 组件事件
 * @event close - 关闭弹窗时触发（点击遮罩层或关闭按钮）
 * @event toggle - 切换产品收藏状态时触发，参数为产品对象
 */
defineEmits(['close', 'toggle'])
</script>
