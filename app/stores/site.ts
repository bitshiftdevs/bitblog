// apps/web/stores/site.ts
import { defineStore } from 'pinia';
import type { SiteSettings } from '~~/lib/types';

interface SiteState {
  settings: {
    title?: string;
    description?: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    socialLinks?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      github?: string;
    };
    seoSettings?: {
      defaultTitle?: string;
      defaultDescription?: string;
      defaultImage?: string;
    };
    analyticsSettings?: {
      googleAnalyticsId?: string;
      facebookPixelId?: string;
    };
    emailSettings?: {
      fromName?: string;
      fromEmail?: string;
      replyTo?: string;
    };
    commentSettings?: {
      enabled?: boolean;
      requireApproval?: boolean;
      allowGuestComments?: boolean;
      enableNotifications?: boolean;
    };
  };
  isLoading: boolean;
  lastUpdated?: string;
}

export const useSiteStore = defineStore('site', {
  state: (): SiteState => ({
    settings: {
      title: 'BitBlog',
      description: 'A modern multi-admin blog platform',
      commentSettings: {
        enabled: true,
        requireApproval: true,
        allowGuestComments: true,
        enableNotifications: true,
      },
    },
    isLoading: false,
    lastUpdated: undefined,
  }),

  getters: {
    siteTitle: (state): string => {
      return state.settings.title || 'BitBlog';
    },

    siteDescription: (state): string => {
      return state.settings.description || 'A modern multi-admin blog platform';
    },

    siteLogo: (state): string | undefined => {
      return state.settings.logo;
    },

    primaryColor: (state): string => {
      return state.settings.primaryColor || '#3b82f6';
    },

    socialLinks: (state) => {
      return state.settings.socialLinks || {};
    },

    seoDefaults: (state) => {
      return {
        title:
          state.settings.seoSettings?.defaultTitle ||
          state.settings.title ||
          'BitBlog',
        description:
          state.settings.seoSettings?.defaultDescription ||
          state.settings.description ||
          'A modern multi-admin blog platform',
        image: state.settings.seoSettings?.defaultImage || '/og-image.png',
      };
    },

    commentConfig: (state) => {
      return (
        state.settings.commentSettings || {
          enabled: true,
          requireApproval: true,
          allowGuestComments: true,
          enableNotifications: true,
        }
      );
    },

    isCommentsEnabled: (state): boolean => {
      return state.settings.commentSettings?.enabled ?? true;
    },

    analyticsConfig: (state) => {
      return state.settings.analyticsSettings || {};
    },
  },

  actions: {
    async loadSettings() {
      if (this.isLoading) return;

      this.isLoading = true;

      try {
        // Check if settings are cached and still fresh (5 minutes)
        if (this.lastUpdated) {
          const lastUpdatedTime = new Date(this.lastUpdated).getTime();
          const now = new Date().getTime();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - lastUpdatedTime < fiveMinutes) {
            return; // Use cached settings
          }
        }

        const { data } = await $fetch<{ data: Record<string, any> }>(
          '/api/settings',
        );

        if (data) {
          // Merge all settings from different keys
          const mergedSettings = Object.values(data).reduce((acc, setting) => {
            return { ...acc, ...setting.value };
          }, {});

          this.settings = { ...this.settings, ...mergedSettings };
          this.lastUpdated = new Date().toISOString();
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
        // Keep using default/cached settings on error
      } finally {
        this.isLoading = false;
      }
    },

    async updateSettings(settings: Partial<SiteState['settings']>) {
      try {
        await $fetch('/api/admin/settings', {
          method: 'PUT',
          body: settings,
        });

        // Update local state
        this.settings = { ...this.settings, ...settings };
        this.lastUpdated = new Date().toISOString();

        return true;
      } catch (error) {
        console.error('Failed to update site settings:', error);
        throw error;
      }
    },

    async updateSingleSetting(key: string, value: any) {
      try {
        await $fetch(`/api/admin/settings/${key}`, {
          method: 'PUT',
          body: { value },
        });

        // Update local state
        this.settings = { ...this.settings, [key]: value };
        this.lastUpdated = new Date().toISOString();

        return true;
      } catch (error) {
        console.error(`Failed to update setting ${key}:`, error);
        throw error;
      }
    },

    // Theme helpers
    applyTheme() {
      if (process.client && this.primaryColor) {
        // Update CSS custom properties for primary color
        const root = document.documentElement;

        // Convert hex to RGB for CSS custom properties
        const hex = this.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`);

        // Generate variations (simplified)
        const variations = {
          50: `${Math.min(255, r + 200)} ${Math.min(255, g + 200)} ${Math.min(255, b + 200)}`,
          100: `${Math.min(255, r + 150)} ${Math.min(255, g + 150)} ${Math.min(255, b + 150)}`,
          200: `${Math.min(255, r + 100)} ${Math.min(255, g + 100)} ${Math.min(255, b + 100)}`,
          300: `${Math.min(255, r + 50)} ${Math.min(255, g + 50)} ${Math.min(255, b + 50)}`,
          400: `${Math.max(0, r - 25)} ${Math.max(0, g - 25)} ${Math.max(0, b - 25)}`,
          600: `${Math.max(0, r - 50)} ${Math.max(0, g - 50)} ${Math.max(0, b - 50)}`,
          700: `${Math.max(0, r - 100)} ${Math.max(0, g - 100)} ${Math.max(0, b - 100)}`,
          800: `${Math.max(0, r - 150)} ${Math.max(0, g - 150)} ${Math.max(0, b - 150)}`,
          900: `${Math.max(0, r - 200)} ${Math.max(0, g - 200)} ${Math.max(0, b - 200)}`,
        };

        Object.entries(variations).forEach(([shade, value]) => {
          root.style.setProperty(`--color-primary-${shade}`, value);
        });
      }
    },

    // Analytics helpers
    trackPageView(path: string, title?: string) {
      if (process.client && this.analyticsConfig.googleAnalyticsId) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
          gtag('config', this.analyticsConfig.googleAnalyticsId, {
            page_path: path,
            page_title: title,
          });
        }
      }

      if (process.client && this.analyticsConfig.facebookPixelId) {
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
          fbq('track', 'PageView');
        }
      }
    },

    // SEO helpers
    generateMetaTags(pageData: {
      title?: string;
      description?: string;
      image?: string;
      type?: string;
      url?: string;
    }) {
      const defaults = this.seoDefaults;

      return {
        title: pageData.title || defaults.title,
        description: pageData.description || defaults.description,
        ogTitle: pageData.title || defaults.title,
        ogDescription: pageData.description || defaults.description,
        ogImage: pageData.image || defaults.image,
        ogType: pageData.type || 'website',
        ogUrl: pageData.url,
        twitterCard: 'summary_large_image',
        twitterTitle: pageData.title || defaults.title,
        twitterDescription: pageData.description || defaults.description,
        twitterImage: pageData.image || defaults.image,
      };
    },

    // Reset to defaults
    resetSettings() {
      this.settings = {
        title: 'BitBlog',
        description: 'A modern multi-admin blog platform',
        commentSettings: {
          enabled: true,
          requireApproval: true,
          allowGuestComments: true,
          enableNotifications: true,
        },
      };
      this.lastUpdated = undefined;
    },

    // Clear cache
    clearCache() {
      this.lastUpdated = undefined;
    },
  },
});

// Auto-load settings on client side
onNuxtReady(() => {
  const siteStore = useSiteStore();

  // Load settings on store creation
  siteStore.loadSettings();

  // Apply theme when settings change
  watch(
    () => siteStore.primaryColor,
    () => siteStore.applyTheme(),
    { immediate: true },
  );
});
