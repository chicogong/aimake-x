<template>
  <div class="bg-decoration"></div>
  <div class="grid-bg"></div>

  <nav class="navbar">
    <div class="navbar-content">
      <div class="logo">AI导航</div>
      <ul class="nav-links">
        <li><a href="#cases">典型案例</a></li>
        <li><a href="#" @click.prevent="isFavoriteModalOpen = true">我的收藏</a></li>
        <li><a href="#">API 文档</a></li>
        <li><a href="#about">关于我们</a></li>
      </ul>
    </div>
  </nav>

  <section class="hero">
    <div class="container">
      <div class="hero-badge">
        <span>已收录 50+ 款 AI 工具</span>
      </div>
      <h1>任何事情先看看<br><span>AI 能不能做</span></h1>
      <p class="hero-subtitle">
        告诉我你想做什么，我帮你找到最适合的 AI 工具
      </p>

      <div class="search-container">
        <div class="search-box">
          <input 
            type="text" 
            class="search-input" 
            v-model="query"
            placeholder="描述你想完成的任务，例如：剪辑一个视频并添加字幕" 
            @keypress.enter="search"
          >
          <button class="search-btn" @click="search">
            <span>智能推荐</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="quick-tags">
          <span class="quick-tag" @click="quickSearch('视频剪辑加字幕')">视频剪辑</span>
          <span class="quick-tag" @click="quickSearch('会议录音转文字')">会议记录</span>
          <span class="quick-tag" @click="quickSearch('分析合同文档')">合同审查</span>
          <span class="quick-tag" @click="quickSearch('写代码')">代码生成</span>
          <span class="quick-tag" @click="quickSearch('处理Excel表格')">Excel处理</span>
          <span class="quick-tag" @click="quickSearch('AI绘画生成图片')">AI绘画</span>
        </div>

        <HistoryTags 
          :history="history" 
          @search="quickSearch" 
          @clear="clearHistory"
        />

        <div class="turnstile-container">
          <div class="cf-turnstile"
               :data-sitekey="turnstileSiteKey"
               data-callback="onTurnstileSuccess"
               data-theme="dark"></div>
        </div>
      </div>
    </div>
  </section>

  <div class="loading" :class="{ active: isLoading }">
    <div class="container">
      <div class="spinner"></div>
      <p style="color: var(--text-secondary);">正在分析你的需求...</p>
    </div>
  </div>

  <section v-if="results" class="results-section active" id="resultsSection" ref="resultsSectionRef">
    <div class="container">
      <div class="results-header">
        <h2>为你推荐</h2>
        <p>{{ resultsTitle }}</p>
      </div>
      
      <!-- Workflow View -->
      <div v-if="results.mode === 'workflow'" class="results-grid">
        <div class="workflow-container">
          <div class="workflow-header">
            <h2 class="workflow-title">{{ results.task || '工作流程' }}</h2>
            <div class="workflow-meta">
              <span v-if="results.complexity" class="meta-badge">
                📊 复杂度: {{ complexityMap[results.complexity] || results.complexity }}
              </span>
              <span v-if="results.estimatedTime" class="meta-badge">
                ⏱️ 预估时间: {{ results.estimatedTime }}
              </span>
              <span v-if="results.source" class="source-badge">
                {{ results.source === 'template' ? '📚 场景模板' : '🤖 AI生成' }}
              </span>
            </div>
            <!-- Mermaid Chart -->
            <div v-if="results.mermaid" class="flowchart-container">
              <div v-html="mermaidSvg"></div>
            </div>
          </div>

          <div class="workflow-steps">
            <StepCard 
              v-for="(step, index) in results.workflow" 
              :key="index" 
              :step="step" 
            />
          </div>
        </div>
      </div>

      <!-- Simple Recommendations View -->
      <div v-else class="results-grid">
        <ProductCard 
          v-for="product in results.recommendations" 
          :key="product.url" 
          :product="product"
          :is-favorite="isFavorite(product.url)"
          @toggle-favorite="toggleFavorite"
        />
      </div>
    </div>
  </section>

  <section class="cases-section" id="cases">
    <div class="container">
      <div class="section-header">
        <h2>典型应用场景</h2>
        <p>看看其他用户是怎么使用 AI 工具提效的</p>
      </div>
      <div class="cases-grid">
        <!-- Reusing legacy logic for cases, or simplify? Let's implement manually for now or fetch -->
        <div v-for="c in cases" :key="c.title" class="case-card" @click="quickSearch(c.title)">
           <div class="case-icon">{{ caseIcons[c.id] || '📌' }}</div>
           <h3 class="case-title">{{ c.title }}</h3>
           <p class="case-pain">{{ c.desc }}</p>
           <div class="case-solution">✓ {{ c.solution }}</div>
           <div class="case-products">
             <span v-for="p in c.products" :key="p" class="case-product-tag">{{ p }}</span>
           </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer" id="about">
    <div class="container">
      <p class="footer-text">
        AI导航 - 任何事情先看看 AI 能不能做<br>
        <a href="#">GitHub</a> · <a href="#">API 文档</a> · <a href="#">反馈建议</a>
      </p>
    </div>
  </footer>

  <FavoritesModal 
    v-if="isFavoriteModalOpen" 
    :favorites="favorites"
    @close="isFavoriteModalOpen = false"
    @toggle="toggleFavorite"
  />

</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import mermaid from 'mermaid'
import ProductCard from './components/ProductCard.vue'
import StepCard from './components/StepCard.vue'
import HistoryTags from './components/HistoryTags.vue'
import FavoritesModal from './components/FavoritesModal.vue'

// --- State ---
const query = ref('')
const results = ref(null)
const isLoading = ref(false)
const history = ref([])
const favorites = ref([])
const cases = ref([])
const isFavoriteModalOpen = ref(false)
const mermaidSvg = ref('')
const resultsSectionRef = ref(null)

let turnstileToken = null

// --- Constants & Config ---
const isLocalhost = window.location.hostname === 'localhost' || window.location.protocol === 'file:'

const API_BASE = isLocalhost
    ? 'http://localhost:8787'
    : 'https://x.aimake.cc'

const turnstileSiteKey = isLocalhost
    ? '1x00000000000000000000AA' // Cloudflare Turnstile Testing Key (Always Pass)
    : '0x4AAAAAACMJv6G1wSzglPJJ'

const caseIcons = { 'gov-doc': '📄', 'invoice': '🧾', 'video': '🎬', 'meeting': '🎙️', 'contract': '📋' }
const complexityMap = { 'simple': '简单', 'moderate': '中等', 'complex': '复杂' }

// --- Computed ---
const resultsTitle = computed(() => {
  if (!results.value) return ''
  return results.value.mode === 'workflow' 
    ? '工作流推荐' 
    : `根据「${results.value.query || results.value.task}」为你推荐`
})

// --- Methods ---

// History
function loadHistory() {
  history.value = JSON.parse(localStorage.getItem('searchHistory') || '[]')
}

function saveHistory(q) {
  let h = history.value.filter(item => item !== q)
  h.unshift(q)
  if (h.length > 10) h = h.slice(0, 10)
  history.value = h
  localStorage.setItem('searchHistory', JSON.stringify(h))
}

function clearHistory() {
  history.value = []
  localStorage.removeItem('searchHistory')
}

// Favorites
function loadFavorites() {
  favorites.value = JSON.parse(localStorage.getItem('userFavorites') || '[]')
}

function isFavorite(id) {
  return favorites.value.some(f => f.id === id)
}

function toggleFavorite(product) {
  const index = favorites.value.findIndex(f => f.id === product.url)
  if (index >= 0) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push({
      id: product.url,
      type: 'tool',
      data: product,
      timestamp: Date.now()
    })
  }
  localStorage.setItem('userFavorites', JSON.stringify(favorites.value))
}

// Search
async function search() {
  if (!query.value.trim()) return
  saveHistory(query.value.trim())

  if (!turnstileToken) {
    // 简单的检查，实际上可能不需要严格阻止，取决于后端
    // alert('请完成人机验证后再试')
    // return
  }

  isLoading.value = true
  results.value = null
  mermaidSvg.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Turnstile-Token': turnstileToken
      },
      body: JSON.stringify({ query: query.value.trim() })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '请求失败')
    }

    const data = await response.json()
    results.value = data

    // Render logic for mermaid
    if (data.mermaid) {
       renderMermaid(data.mermaid)
    }

    // Scroll to results
    nextTick(() => {
      // resultsSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // A bit hacky but ensuring DOM is updated
      setTimeout(() => {
          document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    })

  } catch (error) {
    console.error('Search error:', error)
    alert(error.message || '请求失败，请稍后重试')
  } finally {
    isLoading.value = false
    // Perform reset in a way compatible with Turnstile
    if (window.turnstile) {
        window.turnstile.reset()
        turnstileToken = null
    }
  }
}

function quickSearch(q) {
  query.value = q
  search()
}

// Mermaid
async function renderMermaid(graphDefinition) {
   try {
     const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), graphDefinition)
     mermaidSvg.value = svg
   } catch (error) {
     console.error('Mermaid render failed:', error)
   }
}

// Data Loading
async function loadCases() {
  try {
    const response = await fetch(`${API_BASE}/api/cases`)
    const data = await response.json()
    cases.value = data.cases || []
  } catch (error) {
    console.error('Failed to load cases:', error)
  }
}

// --- Lifecycle ---

onMounted(() => {
  loadHistory()
  loadFavorites()
  loadCases()

  // Initialize Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#0066FF',
        primaryTextColor: '#F9FAFB',
        primaryBorderColor: '#0066FF',
        lineColor: '#3385FF',
        secondaryColor: '#00D9FF',
        tertiaryColor: '#111827'
    }
  })

  // Expose Turnstile callback
  window.onTurnstileSuccess = (token) => {
    turnstileToken = token
    console.log('Turnstile verified')
  }
})
</script>
