import tailwindcss from '@tailwindcss/vite';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@prisma/nuxt',
    '@pinia/nuxt',
  ],
  pinia: {
    // autoImports: ['defineStore', ['defineStore', 'definePiniaStore']],
    storesDirs: ['stores'],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '.prisma/client/index-browser':
          './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
  nitro: {
    preset: 'cloudflareWorker',
    experimental: { wasm: true },
  },
  serverDir: './server/',
  image: {
    cloudflare: {
      //TODO: add base url
    },
  },
  css: ['~/assets/css/global.css'],
  vue: {
    propsDestructure: true,
  },
  // typescript: {
  // 	strict: true,
  // 	typeCheck: true,
  // },
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: '',
    databaseUrl: 'postgresql://kratosgado:28935617@localhost:5432/bitblog',
    r2BucketName: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2Endpoint: '',
    cloudflareAccountId: '',
    cloudflareImagesToken: '',
    nodeEnv: '',

    // SMTP settings
    resendKey: '',

    // Public keys (exposed to client-side)
    public: {
      apiBase: '',
      siteUrl: '',
      r2PublicUrl: '',
      cloudflareImagesUrl: '',
      nodeEnv: '',
    },
  },
  app: {
    head: {
      titleTemplate: '%s - BitShift',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
      ],
    },
  },
});
