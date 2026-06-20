<template>
  <div class="app" :class="{ 'dark-mode': isDark }">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <h1>🗺️ 我的GIS作品集</h1>
        <p class="subtitle">记录学习地理信息科学的成长轨迹与生活足迹</p>
      </div>
      <div class="header-controls">
        <div class="engine-switcher">
          <button
            v-for="engine in engines"
            :key="engine.id"
            :class="['engine-btn', { active: currentEngine === engine.id }]"
            @click="switchEngine(engine.id)"
          >
            {{ engine.label }}
          </button>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到明亮模式' : '切换到暗黑模式'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- 主容器 -->
    <main class="main-container">
      <!-- 地图区域 -->
      <div class="map-wrapper">
        <component :is="currentMapComponent" ref="mapRef" />
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar">
        <!-- 作者信息 -->
        <section class="author-card">
          <img src="../头像.jpg" class="avatar" alt="头像" />
          <h3>GIS学习者</h3>
          <p>地理空间信息工程 · 重庆交通大学</p>
        </section>

        <!-- 分类筛选 -->
        <section class="filter-section">
          <h4>📂 分类筛选</h4>
          <div class="filter-buttons">
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="['filter-btn', { active: activeCategory === cat.id }]"
              :style="activeCategory === cat.id ? { background: cat.color } : {}"
              @click="filterByCategory(cat.id)"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </div>
        </section>

        <!-- 统计信息 -->
        <section class="stats-section">
          <h4>📊 足迹统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总地点</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.categories }}</div>
              <div class="stat-label">分类</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.travel }}</div>
              <div class="stat-label">旅行</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.education }}</div>
              <div class="stat-label">教育</div>
            </div>
          </div>
        </section>

        <!-- 地点列表 -->
        <section class="places-section">
          <h4>📍 地点列表</h4>
          <ul class="places-list">
            <li
              v-for="place in filteredPlaces"
              :key="place.id"
              class="place-item"
              :style="{ borderLeftColor: place.color }"
              @click="focusOnPlace(place)"
            >
              <span class="place-icon">{{ place.icon }}</span>
              <div class="place-info">
                <div class="place-name">{{ place.name }}</div>
                <div class="place-category">{{ place.categoryName }}</div>
              </div>
            </li>
          </ul>
        </section>

        <!-- 图层控制 -->
        <section class="layers-section">
          <h4>🛠️ 图层控制</h4>
          <label class="toggle-item">
            <input type="checkbox" v-model="showLabels" @change="toggleLabels" />
            <span>显示标注</span>
          </label>
          <label class="toggle-item">
            <input type="checkbox" v-model="showRoute" @change="toggleRoute" />
            <span>轨迹线</span>
          </label>
        </section>
      </aside>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <p>🛠️ 技术栈：Vue 3 + Leaflet 1.9.4 + MapLibre GL JS 4.7 + GeoJSON</p>
      <p>📅 完成时间：2026年 | GIS工程与开发课程 P1项目</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import LeafletMap from './components/LeafletMap.vue'
import MapLibreMap from './components/MapLibreMap.vue'
import myPlacesData from './data/myPlaces.json'

// 地图引擎配置
const engines = [
  { id: 'leaflet', label: 'Leaflet', component: LeafletMap },
  { id: 'maplibre', label: 'MapLibre', component: MapLibreMap }
]
const currentEngine = ref('leaflet')
const mapRef = ref(null)

// 计算当前地图组件
const currentMapComponent = computed(() => {
  const engine = engines.find(e => e.id === currentEngine.value)
  return engine ? markRaw(engine.component) : null
})

// 分类配置
const categories = [
  { id: 'all', name: '全部', icon: '🌍', color: '#667eea' },
  { id: 'education', name: '教育', icon: '🎓', color: '#3498db' },
  { id: 'travel', name: '旅行', icon: '✈️', color: '#27ae60' },
  { id: 'food', name: '美食', icon: '🍜', color: '#f39c12' },
  { id: 'culture', name: '文化', icon: '🏛️', color: '#e67e22' },
  { id: 'life', name: '生活', icon: '🏠', color: '#9b59b6' },
  { id: 'dream', name: '梦想', icon: '🎯', color: '#1abc9c' }
]
const activeCategory = ref('all')

// 筛选后的地点
const filteredPlaces = computed(() => {
  if (activeCategory.value === 'all') {
    return myPlacesData.features.map(f => f.properties)
  }
  return myPlacesData.features
    .filter(f => f.properties.category === activeCategory.value)
    .map(f => f.properties)
})

// 统计信息
const stats = computed(() => {
  const features = myPlacesData.features
  const cats = [...new Set(features.map(f => f.properties.category))]
  return {
    total: features.length,
    categories: cats.length,
    travel: features.filter(f => f.properties.category === 'travel').length,
    education: features.filter(f => f.properties.category === 'education').length
  }
})

// 图层控制
const showLabels = ref(true)
const showRoute = ref(true)
const isDark = ref(false)

// 切换主题
function toggleTheme() {
  isDark.value = !isDark.value
}

// 切换地图引擎
function switchEngine(engineId) {
  currentEngine.value = engineId
}

// 按分类筛选
function filterByCategory(categoryId) {
  activeCategory.value = categoryId
}

// 聚焦到指定地点
function focusOnPlace(place) {
  if (mapRef.value && mapRef.value.focusOnPlace) {
    mapRef.value.focusOnPlace(place)
  }
}

// 切换标注显示
function toggleLabels() {
  if (mapRef.value && mapRef.value.toggleLabels) {
    mapRef.value.toggleLabels(showLabels.value)
  }
}

// 切换轨迹线显示
function toggleRoute() {
  if (mapRef.value && mapRef.value.toggleRoute) {
    mapRef.value.toggleRoute(showRoute.value)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content h1 {
  font-size: 1.5rem;
  margin-bottom: 3px;
}

.header-content .subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.engine-switcher {
  display: flex;
  gap: 8px;
}

.engine-btn {
  padding: 8px 16px;
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.engine-btn:hover {
  background: rgba(255,255,255,0.1);
}

.engine-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.theme-toggle {
  padding: 8px 12px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.theme-toggle:hover {
  background: rgba(255,255,255,0.2);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

/* 地图区域 */
.map-wrapper {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
}

/* 侧边栏 */
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.sidebar section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.sidebar h4 {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

/* 作者卡片 */
.author-card {
  text-align: center;
}

.author-card .avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 10px;
  border: 3px solid #667eea;
}

.author-card h3 {
  font-size: 1rem;
  margin-bottom: 5px;
}

.author-card p {
  font-size: 0.8rem;
  color: #888;
}

/* 分类筛选 */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 15px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #666;
}

.filter-btn:hover {
  transform: translateY(-1px);
}

.filter-btn.active {
  color: white;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.7rem;
  color: #888;
}

/* 地点列表 */
.places-list {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
}

.place-item {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 3px solid;
}

.place-item:hover {
  background: #f0f0f0;
}

.place-icon {
  font-size: 1.2rem;
}

.place-info {
  flex: 1;
  min-width: 0;
}

.place-name {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.place-category {
  font-size: 0.7rem;
  color: #888;
}

/* 图层控制 */
.layers-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.toggle-item input {
  cursor: pointer;
}

/* 底部 */
.footer {
  background: #2c3e50;
  color: white;
  padding: 15px 20px;
  text-align: center;
  font-size: 0.8rem;
}

.footer p {
  margin: 3px 0;
  opacity: 0.8;
}

/* 响应式 */
@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    max-height: 300px;
  }
}

/* 暗黑模式 */
.dark-mode body {
  background-color: #1a1a2e;
  color: #ffffff;
}

.dark-mode .app {
  background-color: #1a1a2e;
}

.dark-mode .header {
  background: linear-gradient(135deg, #2d1b69 0%, #1a1a2e 100%);
}

.dark-mode .sidebar section {
  background: #16213e;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.dark-mode .sidebar h4 {
  color: #ffffff;
  border-bottom-color: #333;
}

.dark-mode .author-card h3 {
  color: #ffffff;
}

.dark-mode .author-card p {
  color: #ffffff;
}

.dark-mode .filter-btn {
  background: #2d3436;
  color: #ffffff;
}

.dark-mode .filter-btn:hover {
  background: #3d4345;
}

.dark-mode .stat-item {
  background: #0f3460;
}

.dark-mode .stat-value {
  color: #6c5ce7;
}

.dark-mode .stat-label {
  color: #ffffff;
}

.dark-mode .place-item:hover {
  background: #2d3436;
}

.dark-mode .place-name {
  color: #ffffff;
}

.dark-mode .place-category {
  color: #ffffff;
}

.dark-mode .footer {
  background: #0f3460;
}

.dark-mode .footer p {
  color: #ffffff;
  opacity: 0.8;
}

.dark-mode .engine-btn {
  border-color: rgba(255,255,255,0.2);
}

.dark-mode .engine-btn:hover {
  background: rgba(255,255,255,0.05);
}

.dark-mode .engine-btn.active {
  background: #6c5ce7;
  color: white;
  border-color: #6c5ce7;
}

.dark-mode .theme-toggle {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

.dark-mode .theme-toggle:hover {
  background: rgba(255,255,255,0.2);
}
</style>
