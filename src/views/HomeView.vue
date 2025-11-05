<script setup lang="ts">
import { ref } from 'vue'
import * as Sentry from '@sentry/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorLog = ref<string[]>([])

// 1. 运行时错误 - 调用未定义的函数
const triggerUndefinedFunction = () => {
  try {
    // @ts-ignore
    myUndefinedFunction()
  } catch (error) {
    addLog('触发了未定义函数错误')
    throw error
  }
}

// 2. 手动抛出错误
const triggerManualError = () => {
  addLog('手动抛出自定义错误')
  throw new Error('这是一个手动触发的测试错误！')
}

// 3. Promise rejection 错误
const triggerPromiseRejection = () => {
  addLog('触发 Promise rejection')
  Promise.reject(new Error('Promise 被拒绝了！'))
}

// 4. 异步错误
const triggerAsyncError = async () => {
  addLog('触发异步错误')
  await new Promise((resolve) => setTimeout(resolve, 100))
  throw new Error('异步函数中的错误！')
}

// 5. 类型错误
const triggerTypeError = () => {
  addLog('触发类型错误')
  const obj: any = null
  console.log(obj.property.nested)
}

// 6. 引用错误
const triggerReferenceError = () => {
  addLog('触发引用错误')
  // @ts-ignore
  console.log(nonExistentVariable)
}

// 7. 网络错误模拟
const triggerNetworkError = async () => {
  addLog('触发网络错误')
  try {
    await fetch('https://invalid-url-that-does-not-exist-12345.com/api')
  } catch (error) {
    throw new Error('网络请求失败: ' + error)
  }
}

// 8. 使用 Sentry.captureException 手动捕获
const triggerCaptureException = () => {
  addLog('使用 Sentry.captureException 手动捕获异常')
  const error = new Error('这是通过 Sentry.captureException 手动捕获的错误')
  Sentry.captureException(error, {
    tags: {
      section: 'home-view',
      action: 'manual-capture',
    },
    level: 'error',
  })
}

// 9. 使用 Sentry.captureMessage 发送消息
const triggerCaptureMessage = () => {
  addLog('使用 Sentry.captureMessage 发送消息')
  Sentry.captureMessage('这是一条测试消息', {
    level: 'warning',
    tags: {
      section: 'home-view',
    },
  })
}

// 10. 带上下文的错误
const triggerErrorWithContext = () => {
  addLog('触发带上下文信息的错误')
  Sentry.setContext('user_action', {
    page: 'home',
    action: 'test_error',
    timestamp: new Date().toISOString(),
  })
  throw new Error('带有额外上下文信息的错误')
}

const addLog = (message: string) => {
  errorLog.value.unshift(`${new Date().toLocaleTimeString()} - ${message}`)
  if (errorLog.value.length > 10) {
    errorLog.value = errorLog.value.slice(0, 10)
  }
}

const clearLog = () => {
  errorLog.value = []
}
</script>

<template>
  <main class="home-container">
    <div class="header">
      <h1>🏠 Sentry 错误测试 - 首页</h1>
      <p class="subtitle">点击下方按钮触发不同类型的错误，测试 Sentry 的错误捕获功能</p>
      <button @click="router.push('/about')">about 页面</button>
    </div>

    <div class="test-section">
      <h2>🔥 错误触发器</h2>

      <div class="button-grid">
        <button class="error-btn btn-danger" @click="triggerUndefinedFunction">
          <span class="btn-icon">⚠️</span>
          <span class="btn-text">未定义函数</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerManualError">
          <span class="btn-icon">💥</span>
          <span class="btn-text">手动抛出错误</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerPromiseRejection">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Promise Rejection</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerAsyncError">
          <span class="btn-icon">⏳</span>
          <span class="btn-text">异步错误</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerTypeError">
          <span class="btn-icon">📛</span>
          <span class="btn-text">类型错误</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerReferenceError">
          <span class="btn-icon">🔗</span>
          <span class="btn-text">引用错误</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerNetworkError">
          <span class="btn-icon">🌐</span>
          <span class="btn-text">网络错误</span>
        </button>

        <button class="error-btn btn-info" @click="triggerCaptureException">
          <span class="btn-icon">📸</span>
          <span class="btn-text">手动捕获异常</span>
        </button>

        <button class="error-btn btn-info" @click="triggerCaptureMessage">
          <span class="btn-icon">💬</span>
          <span class="btn-text">发送消息</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerErrorWithContext">
          <span class="btn-icon">📋</span>
          <span class="btn-text">带上下文错误</span>
        </button>
      </div>
    </div>

    <div class="log-section">
      <div class="log-header">
        <h3>📝 操作日志</h3>
        <button class="clear-btn" @click="clearLog">清空</button>
      </div>
      <div class="log-content">
        <div v-if="errorLog.length === 0" class="log-empty">暂无日志记录</div>
        <div v-else class="log-list">
          <div v-for="(log, index) in errorLog" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.test-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.error-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.btn-icon {
  font-size: 2rem;
}

.btn-text {
  font-size: 0.9rem;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
}

.btn-info {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.log-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.clear-btn:hover {
  background: #7f8c8d;
}

.log-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.log-empty {
  text-align: center;
  color: #95a5a6;
  padding: 2rem;
  font-style: italic;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #3498db;
  font-size: 0.9rem;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .button-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .header h1 {
    font-size: 2rem;
  }

  .home-container {
    padding: 1rem;
  }
}
</style>
