import { defineNuxtPlugin } from '#app'
import { setActivePinia, createPinia } from 'pinia'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = createPinia()
  setActivePinia(pinia)
  nuxtApp.vueApp.use(pinia)
}) 