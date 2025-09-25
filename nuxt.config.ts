import tailwindcss from '@tailwindcss/vite';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-tiptap-editor',
    'nuxt-auth-utils',
  ],
  typescript: {
    sharedTsConfig: {
      compilerOptions: {
        strictNullChecks: false,
      },
    },
  },
  tiptap: {
    prefix: '',
    lowlight: {
      theme: 'tokyo-night-dark',
    },
  },
  pinia: { storesDirs: ['./app/stores/**'] },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'accent', 'neutral', 'base', 'info', 'success', 'warning', 'error'],
    },
  },
  loadingIndicator: {
    name: 'chasing-dots',
    color: '#3b82f6',
    background: 'rgba(255, 255, 255, 0.8)',
    height: '4px',
    throttle: 0,
    duration: 300,
    continuous: true
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: { manualChunks: { vendor: ['vue', 'vue-router', 'pinia'] } },
      },
    },
  },
  fonts: { families: [{ name: 'Inter', provider: 'google' }] },
  nitro: { preset: 'vercel' },
  experimental: { typedPages: true, viewTransition: true },
  serverDir: './server/',
  css: ['~/assets/css/global.css'],
  vue: { propsDestructure: true },
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: '',
    databaseUrl: '',
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
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
        redirectURL: '',
      },
      github: {
        clientId: '',
        clientSecret: '',
        redirectURL: '',
      },
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
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },

    // Blog post pages cached for 1 hour
    '/posts/**': {
      headers: { 'cache-control': 's-maxage=3600' },
      prerender: true,
    },

    // Tag and category pages cached
    '/tags/**': {
      headers: { 'cache-control': 's-maxage=1800' },
      prerender: true,
    },
    '/categories/**': {
      headers: { 'cache-control': 's-maxage=1800' },
      prerender: true,
    },

    // Author pages cached
    '/authors/**': {
      headers: { 'cache-control': 's-maxage=1800' },
      prerender: true,
    },

    // Admin pages - SPA mode, no caching
    '/admin/**': {
      ssr: false,
      headers: { 'cache-control': 'no-cache' },
    },

    // API routes
    '/api/**': {
      headers: { 'cache-control': 'no-cache' },
      cors: true,
    },

    // Static assets cached for 1 year
    '/assets/**': {
      headers: { 'cache-control': 'max-age=31536000' },
    },
  },
});

