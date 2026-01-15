/**
 * 应用入口文件
 *
 * @file frontend/src/main.js
 * @description
 * Vue 3 应用的入口文件，负责：
 * 1. 导入全局样式（深色主题 + 响应式布局）
 * 2. 创建 Vue 应用实例
 * 3. 将根组件挂载到 #app DOM 元素
 *
 * 挂载目标由 public/index.html 提供。
 */

import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'

createApp(App).mount('#app')
