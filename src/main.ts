import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'
const app = createApp(App)
if (import.meta.env.VITE_MODE === 'production') {
  console.log('import.meta.env.VITE_SENTRY_DSN', import.meta.env.VITE_SENTRY_DSN)
  const appVersion = import.meta.env.VITE_APP_VERSION;
  console.log('appVersion', appVersion)
  // 在这里初始化 Sentry
  Sentry.init({
    app, // 传入 Vue app 实例
    dsn: import.meta.env.VITE_SENTRY_DSN, // 替换成你自己的 DSN

    // 建议：将 Sentry 与 router 集成（如果使用了 vue-router）
    integrations: [
      Sentry.browserTracingIntegration({ router }), // 性能追踪
      Sentry.replayIntegration(), // 用户会话重放
    ],
    release: `vue-project-sentry@${appVersion}`, // 示例：'my-vue-project@1.0.2'
    // 性能监控配置
    tracesSampleRate: 1.0, // 生产环境建议调低（例如 0.2）

    // 会话重放配置 (可选，但非常有用)
    replaysSessionSampleRate: 0.1, // 10% 的会话会被录制
    replaysOnErrorSampleRate: 1.0, // 发生错误的会话 100% 会被录制

    // 区分环境
    environment: import.meta.env.VITE_MODE, // 例如 'development', 'production'
  });
}

app.use(createPinia())
app.use(router)

app.mount('#app')
