import tailwindcss from '@tailwindcss/vite';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // debug: true,
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/mdc',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],
  mdc: {
    components: {
      prose: true,
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://blog.bitshiftdevs.com',
    name: 'BitShift',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/auth', '/profile'],
  },
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'BitShift',
      logo: '/logo.png',
    },
  },
  typescript: {
    sharedTsConfig: {
      compilerOptions: {
        strictNullChecks: false,
      },
    },
  },

  pinia: { storesDirs: ['./app/stores/**'] },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'accent', 'neutral', 'base', 'info', 'success', 'warning', 'error'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['zod'],
    },
  },
  fonts: {
    families: [{ name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] }],
    defaults: { weights: [400, 500, 600, 700], display: 'swap' },
  },
  nitro: { preset: 'vercel' },
  experimental: { typedPages: true },
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
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s - BitShift',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
          sizes: 'any',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/icon-192.png',
          sizes: '192x192',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/icon-512.png',
          sizes: '512x512',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'BitShift RSS Feed',
          href: '/api/rss.xml',
        },
        {
          rel: 'alternate',
          type: 'application/feed+json',
          title: 'BitShift JSON Feed',
          href: '/api/feed.json',
        },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },
  routeRules: {
    // Homepage - ISR with 10 min revalidation
    // '/': { isr: 600 },
    //
    // Blog post pages - ISR with 1 hour revalidation
    '/posts/**': { isr: 3600 },

    // Tag and category pages - ISR with 30 min revalidation
    '/tags/**': { isr: 1800 },
    '/categories/**': { isr: 1800 },

    // Author pages - ISR with 30 min revalidation
    '/authors/**': { isr: 1800 },

    // // Admin pages - SPA mode, no SSR (saves bundle from shipping to public)
    // '/admin/**': {
    //   ssr: false,
    //   headers: { 'cache-control': 'no-cache, no-store' },
    // },
    //
    // // API routes - no caching by default
    // '/api/**': {
    //   headers: { 'cache-control': 'no-cache' },
    //   cors: true,
    // },
    // Public read APIs - cache at CDN
    '/api/posts/**': {
      headers: { 'cache-control': 's-maxage=300, stale-while-revalidate=600' },
      cors: true,
    },
    // '/api/categories/**': {
    //   headers: { 'cache-control': 's-maxage=600, stale-while-revalidate=1200' },
    //   cors: true,
    // },
    // '/api/authors/**': {
    //   headers: { 'cache-control': 's-maxage=3600, stale-while-revalidate=7200' },
    //   cors: true,
    // },

    // Static assets cached for 1 year (fingerprinted by Nuxt)
    '/_nuxt/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
  },
});
