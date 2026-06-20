import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/my-gis-portfolio/', // 必须和GitHub仓库名称完全一致
  build: {
    outDir: "docs" // 打包产物输出到docs文件夹
  },
  plugins: [vue()],
  server: {
    port: 5178,
    host: true
  }
})

