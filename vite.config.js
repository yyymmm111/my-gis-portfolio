import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/my-gis-portfolio/', // 必须和GitHub仓库名称完全一致
  plugins: [vue()],
  server: {
    port: 5178,
    host: true
  }
})

