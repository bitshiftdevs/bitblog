import type { AuthStore } from '~/stores/auth';
import type { SiteStore } from '~/stores/site';

declare module '#app' {
  interface NuxtApp {
    $auth: AuthStore;
    $siteStore: SiteStore;
  }
}
