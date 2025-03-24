// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@pinia/nuxt'
  ],
  app: {
    head: {
      title: 'Bitcoin Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      backendUrl: process.env.BACKEND_URL || 'http://localhost:3001'
    }
  },
  // Важное исправление для Vite:
  build: {
    transpile: ['pinia']
  },
  // Правильная конфигурация Pinia
  pinia: {
    autoImports: ['defineStore']
  },
  typescript: {
    strict: false,
    typeCheck: false
  },
  nitro: {
    preset: 'node-server',
    // Настройка проксирования для API
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    },
    routeRules: {
      '/api/**': {
        proxy: process.env.BACKEND_URL || 'http://localhost:3001'
      }
    }
  },
  // Отключаем автоматические импорты
  imports: {
    dirs: []
  },
  // Добавляем правильную конфигурацию для сборки
  vite: {
    define: {
      'process.dev': process.dev,
    },
    optimizeDeps: {
      include: ['pinia']
    },
    // Настройка прокси Vite
    server: {
      proxy: {
        '/api': {
          target: process.env.BACKEND_URL || 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  },
  // Отключаем экспериментальные функции
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: false
  },
  compatibility: {
    date: '2025-03-22'
  },
  // Дополнительные девелоперские настройки
  devtools: {
    enabled: true
  }
})