import { defineNuxtPlugin } from '#app'
import { createPinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
  
  // Важно: возвращаем provide для правильной интеграции с Nuxt
  return {
    provide: {
      pinia
    }
  }
}) 