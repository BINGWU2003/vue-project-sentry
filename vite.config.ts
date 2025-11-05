import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { sentryVitePlugin } from '@sentry/vite-plugin' // 引入插件

// https://vite.dev/config/
export default defineConfig({
  build: {
    // sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : false,
    sourcemap: true
  },
  plugins: [
    vue(),
    vueDevTools(),
    // Sentry 插件必须放在所有插件的末尾 (或在 Vite 压缩插件之后)
    sentryVitePlugin({
      org: process.env.SENTRY_ORG, // 你 Sentry 组织的 slug
      project: process.env.SENTRY_PROJECT, // 你 Sentry 项目的 slug

      // 从环境变量读取 Auth Token，更安全
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**', // 指定查找 sourcemap 的路径
        filesToDeleteAfterUpload: './dist/**/*.map', // 上传后删除
      },
      // 关键：明确指定 release
      release: {
        // 使用与 main.ts 中完全相同的格式
        name: `vue-project-sentry@${process.env.npm_package_version}`
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
