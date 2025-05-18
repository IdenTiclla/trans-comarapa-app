// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // CSS global
  css: ['~/assets/css/main.css'],

  // Módulos
  modules: [
    ['@pinia/nuxt', {
      autoImports: ['defineStore', 'acceptHMRUpdate'],
      disableVuex: true,
    }],
    '@nuxtjs/tailwindcss',
  ],

  // Configuración de PostCSS
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Configuración de runtime
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    }
  },

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
  },

  // Configuración de rutas
  routeRules: {
    // The incorrect '/**': { middleware: ['auth'] } line should be removed.
    // Example of a correct routeRule: 'admin/**': { ssr: false }
  }
})
