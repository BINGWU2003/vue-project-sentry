<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue'
import * as Sentry from '@sentry/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorCount = ref(0)
const componentError = ref<string | null>(null)
const performanceTest = ref(false)

// 组件错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('组件捕获到错误:', err, info)
  componentError.value = `${err.message} (${info})`
  return false // 继续向上传播
})

// 1. 内存泄漏模拟
const triggerMemoryLeak = () => {
  const leakyArray: any[] = []
  const interval = setInterval(() => {
    // 持续添加数据但不清理
    leakyArray.push(new Array(1000000).fill('leak'))
    console.log('内存泄漏中...', leakyArray.length)
  }, 100)

  Sentry.captureMessage('触发了内存泄漏测试', { level: 'warning' })

  // 5秒后清理，避免真的泄漏
  setTimeout(() => {
    clearInterval(interval)
    leakyArray.length = 0
    console.log('内存泄漏测试结束')
  }, 5000)
}

// 2. 循环错误
const triggerInfiniteLoop = () => {
  Sentry.captureMessage('触发了无限循环错误（已限制）', { level: 'warning' })
  let count = 0
  const limit = 1000000
  while (count < limit) {
    count++
  }
  throw new Error(`循环执行了 ${limit} 次后抛出错误`)
}

// 3. 堆栈溢出
const triggerStackOverflow = () => {
  Sentry.captureMessage('触发堆栈溢出错误', { level: 'error' })
  const recursiveFunction = (depth: number): any => {
    if (depth > 10000) {
      throw new Error('达到最大递归深度')
    }
    return recursiveFunction(depth + 1)
  }
  recursiveFunction(0)
}

// 4. JSON 解析错误
const triggerJSONError = () => {
  Sentry.captureMessage('触发 JSON 解析错误', { level: 'error' })
  const invalidJSON = '{invalid: json, missing: "quotes"}'
  JSON.parse(invalidJSON)
}

// 5. 跨域错误模拟
const triggerCORSError = async () => {
  Sentry.captureMessage('触发跨域错误', { level: 'error' })
  try {
    await fetch('https://example.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    throw new Error('跨域请求失败: ' + error)
  }
}

// 6. 多个连续错误
const triggerMultipleErrors = () => {
  Sentry.captureMessage('开始触发多个连续错误', { level: 'info' })

  setTimeout(() => {
    try {
      throw new Error('第1个错误')
    } catch (e) {
      Sentry.captureException(e)
    }
  }, 100)

  setTimeout(() => {
    try {
      throw new Error('第2个错误')
    } catch (e) {
      Sentry.captureException(e)
    }
  }, 200)

  setTimeout(() => {
    throw new Error('第3个错误（未捕获）')
  }, 300)
}

// 7. 自定义错误类
class CustomBusinessError extends Error {
  code: string
  context: any

  constructor(message: string, code: string, context?: any) {
    super(message)
    this.name = 'CustomBusinessError'
    this.code = code
    this.context = context
  }
}

const triggerCustomError = () => {
  const error = new CustomBusinessError('业务逻辑错误：用户余额不足', 'INSUFFICIENT_BALANCE', {
    userId: '12345',
    requiredAmount: 1000,
    currentBalance: 500,
  })

  Sentry.captureException(error, {
    tags: {
      errorType: 'business',
      errorCode: error.code,
    },
    contexts: {
      business: error.context,
    },
  })

  throw error
}

// 8. 性能问题模拟
// const triggerPerformanceIssue = () => {
//   performanceTest.value = true
//   Sentry.captureMessage('开始性能测试', { level: 'info' })

//   const transaction = Sentry.startTransaction({
//     name: 'performance-test',
//     op: 'test',
//   })

//   // 模拟慢查询
//   const span1 = transaction.startChild({
//     op: 'db.query',
//     description: '慢速数据库查询',
//   })

//   setTimeout(() => {
//     span1.finish()

//     // 模拟慢速 API 调用
//     const span2 = transaction.startChild({
//       op: 'http',
//       description: '慢速 API 请求',
//     })

//     setTimeout(() => {
//       span2.finish()
//       transaction.finish()
//       performanceTest.value = false
//       alert('性能测试完成！查看 Sentry 性能监控面板')
//     }, 2000)
//   }, 3000)
// }

// 9. 错误边界测试
const ErrorBoundaryTest = ref(false)
const triggerComponentError = () => {
  ErrorBoundaryTest.value = true
  errorCount.value++
}

// 10. Breadcrumb 测试
const triggerBreadcrumbTest = () => {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: '用户点击了面包屑测试按钮',
    level: 'info',
  })

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: '用户准备执行一个操作',
    level: 'info',
  })

  Sentry.addBreadcrumb({
    category: 'api',
    message: '模拟 API 调用',
    level: 'info',
    data: {
      url: '/api/test',
      method: 'POST',
    },
  })

  setTimeout(() => {
    throw new Error('这是一个带有完整面包屑追踪的错误')
  }, 500)
}

onMounted(() => {
  console.log('About 页面已加载')
})
</script>

<template>
  <div class="about-container">
    <div class="header">
      <h1>ℹ️ Sentry 高级测试 - 关于页面</h1>
      <p class="subtitle">更多复杂场景和边界情况的错误测试</p>
      <button @click="router.push('/')">home 页面</button>
    </div>

    <div class="test-section">
      <h2>🚨 高级错误场景</h2>

      <div class="button-grid">
        <button class="error-btn btn-danger" @click="triggerMemoryLeak">
          <span class="btn-icon">💾</span>
          <span class="btn-text">内存泄漏</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerInfiniteLoop">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">无限循环</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerStackOverflow">
          <span class="btn-icon">📚</span>
          <span class="btn-text">堆栈溢出</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerJSONError">
          <span class="btn-icon">📋</span>
          <span class="btn-text">JSON 解析错误</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerCORSError">
          <span class="btn-icon">🌍</span>
          <span class="btn-text">跨域错误</span>
        </button>

        <button class="error-btn btn-danger" @click="triggerMultipleErrors">
          <span class="btn-icon">💥</span>
          <span class="btn-text">多个连续错误</span>
        </button>

        <button class="error-btn btn-warning" @click="triggerCustomError">
          <span class="btn-icon">🏢</span>
          <span class="btn-text">自定义业务错误</span>
        </button>

        <!-- <button class="error-btn btn-info" @click="triggerPerformanceIssue">
          <span class="btn-icon">⚡</span>
          <span class="btn-text">性能问题</span>
        </button> -->

        <button class="error-btn btn-danger" @click="triggerComponentError">
          <span class="btn-icon">🧩</span>
          <span class="btn-text">组件错误</span>
        </button>

        <button class="error-btn btn-info" @click="triggerBreadcrumbTest">
          <span class="btn-icon">🍞</span>
          <span class="btn-text">面包屑追踪</span>
        </button>
      </div>
    </div>

    <div v-if="performanceTest" class="performance-indicator">
      <div class="loading-spinner"></div>
      <p>性能测试进行中... 请等待</p>
    </div>

    <div v-if="componentError" class="error-alert">
      <h3>⚠️ 组件错误被捕获</h3>
      <p>{{ componentError }}</p>
      <button @click="componentError = null">关闭</button>
    </div>

    <div class="info-section">
      <h2>📊 测试统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ errorCount }}</div>
          <div class="stat-label">错误触发次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">10</div>
          <div class="stat-label">测试场景数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">2</div>
          <div class="stat-label">测试页面</div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h3>💡 使用提示</h3>
      <ul>
        <li>📌 确保已正确配置 Sentry DSN</li>
        <li>🔍 在 Sentry 控制台查看捕获的错误详情</li>
        <li>🏷️ 注意观察不同错误的标签和上下文信息</li>
        <li>📈 查看性能监控面板了解性能追踪</li>
        <li>🍞 面包屑功能可以帮助追踪错误发生前的用户操作</li>
        <li>⚙️ 某些测试（如内存泄漏）已限制影响范围</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.about-container {
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

.performance-indicator {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-alert {
  background: #f8d7da;
  border: 2px solid #f5c6cb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.error-alert h3 {
  color: #721c24;
  margin-bottom: 0.5rem;
}

.error-alert p {
  color: #721c24;
  margin-bottom: 1rem;
}

.error-alert button {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.info-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.tips-section {
  background: #e8f5e9;
  border-radius: 12px;
  padding: 2rem;
  border-left: 5px solid #4caf50;
}

.tips-section h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.tips-section ul {
  list-style: none;
  padding: 0;
}

.tips-section li {
  padding: 0.5rem 0;
  color: #1b5e20;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .button-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .header h1 {
    font-size: 2rem;
  }

  .about-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
