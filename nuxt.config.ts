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
        '.prisma/client/index-browser': './shared/generated/prisma/browser.ts',
        // '.prisma/client/default': './node_modules/@prisma/client/client.ts',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
    // assetsInclude: ['**/*.wasm'],
    // optimizeDeps: {
    //   exclude: ['@prisma/client'],
    // },
    // define: {
    //   __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    //   // _global: {}, // Instead of 'global: ({})' :cite[4]
    // },
  },
  nitro: {
    // preset: 'cloudflareWorker',
    // wasm: {
    //   esmImport: true,
    // },
    // cloudflare: {
    //   nodeCompat: true,
    // },
    // experimental: { wasm: true },
  },
  experimental: { typedPages: true, viewTransition: true },
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
  // routeRules: {
  //   // Homepage pre-rendered at build time
  //   '/': { prerender: true },
  //
  //   // Blog post pages cached for 1 hour
  //   '/posts/**': {
  //     headers: { 'cache-control': 's-maxage=3600' },
  //     prerender: true,
  //   },
  //
  //   // Tag and category pages cached
  //   '/tags/**': {
  //     headers: { 'cache-control': 's-maxage=1800' },
  //     prerender: true,
  //   },
  //   '/categories/**': {
  //     headers: { 'cache-control': 's-maxage=1800' },
  //     prerender: true,
  //   },
  //
  //   // Author pages cached
  //   '/authors/**': {
  //     headers: { 'cache-control': 's-maxage=1800' },
  //     prerender: true,
  //   },
  //
  //   // Admin pages - SPA mode, no caching
  //   '/admin/**': {
  //     ssr: false,
  //     headers: { 'cache-control': 'no-cache' },
  //   },
  //
  //   // API routes
  //   '/api/**': {
  //     headers: { 'cache-control': 'no-cache' },
  //     cors: true,
  //   },
  //
  //   // Static assets cached for 1 year
  //   '/assets/**': {
  //     headers: { 'cache-control': 'max-age=31536000' },
  //   },
  // },
});
