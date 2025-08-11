// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/api1/**': { proxy: `${process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3001'}/**` },
    },
  },
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      externalApiUrl: process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3000',
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-16'
})