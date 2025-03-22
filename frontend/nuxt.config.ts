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
  // Добавляем конфигурацию для Pinia
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  },
  // Добавляем дату совместимости
  compatibility: {
    date: '2025-03-22'
  }
})