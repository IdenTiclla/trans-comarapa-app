// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // CSS global
  css: ['~/assets/css/main.css'],

  // Módulos
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  // Configuración de la aplicación
  app: {
    head: {
      title: 'Trans Comarapa',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Empresa de transporte Trans Comarapa' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
