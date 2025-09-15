import { useSiteStore } from '~/stores/site';

// apps/web/plugins/02.site.client.ts
export default defineNuxtPlugin(async () => {
  const siteStore = useSiteStore();

  await siteStore.loadSettings();
});
