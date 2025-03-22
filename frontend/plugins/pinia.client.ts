import { pinia } from '~/composables/usePinia'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(pinia)
}) 