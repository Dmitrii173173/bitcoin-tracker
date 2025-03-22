// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ssr: false,
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
  nitro: {
    preset: 'node-server'
  },
  imports: {
    dirs: ['composables']
  },
  vite: {
    define: {
      'window.global': {}
    }
  },
  modules: [],
  build: {
    transpile: ['chart.js']
  }
})
