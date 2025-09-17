import { useSiteStore } from '~/stores/site';

export default defineNuxtPlugin(async () => {
  const siteStore = useSiteStore();

  await siteStore.loadSettings();
});
