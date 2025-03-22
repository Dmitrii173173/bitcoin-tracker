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
  typescript: {
    strict: false,
    typeCheck: false
  },
  nitro: {
    preset: 'node-server'
  },
  // Упрощаем конфигурацию Pinia
  pinia: {
    autoImports: ['defineStore']
  },
  // Отключаем автоматические импорты
  imports: {
    dirs: []
  },
  build: {
    transpile: ['pinia']
  },
  // Добавляем дату совместимости
  experimental: {
    payloadExtraction: false
  },
  compatibility: {
    date: '2025-03-22'
  }
})