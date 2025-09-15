export const useSite = () => {
  const siteStore = useSiteStore()
  
  return {
    settings: computed(() => siteStore.settings),
    siteTitle: computed(() => siteStore.siteTitle),
    siteDescription: computed(() => siteStore.siteDescription),
    socialLinks: computed(() => siteStore.socialLinks),
    generateMetaTags: siteStore.generateMetaTags,
    trackPageView: siteStore.trackPageView,
    loadSettings: siteStore.loadSettings,
  }
}
