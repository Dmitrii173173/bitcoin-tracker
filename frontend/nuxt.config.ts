// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  // Удаляем модуль Pinia
  modules: [],
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
  typescript: {
    strict: false,
    typeCheck: false
  },
  nitro: {
    preset: 'node-server'
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
  }
})