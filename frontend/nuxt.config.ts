// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s - Legal Intelligence',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Legal Intelligence: manage legal documents, sections, references, notes, and blogs with a modern Nuxt frontend.' },
        { name: 'robots', content: 'index,follow' },
        { name: 'theme-color', content: '#10b981' },
        // Open Graph defaults
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Legal Intelligence' },
        { property: 'og:title', content: 'Legal Intelligence' },
        { property: 'og:description', content: 'Manage and explore legal documents and insights.' },
        // Twitter Card defaults
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Legal Intelligence' },
        { name: 'twitter:description', content: 'Manage and explore legal documents and insights.' }
      ]
    }
  },
  nitro: {
    routeRules: {
      // Public pages: SSR/ISR/SWR for SEO and performance
      '/': { prerender: true },
      '/blog': { isr: 3600 },
      '/blog/**': { isr: true },
      '/documents': { swr: 3600 },
      '/documents/**': { swr: 3600 },
      // Admin area: client-side only
      '/admin/**': { ssr: false, headers: { 'x-robots-tag': 'noindex, nofollow' } },
      // API proxy in development
      '/api1/**': { proxy: `${process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3001'}/**` },
    },
  },
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      externalApiUrl: process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3000',
      // Used to build absolute canonical URLs for SEO
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001'
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