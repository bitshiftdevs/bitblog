// apps/web/stores/site.ts
import { defineStore } from 'pinia';
import type { SiteSettings } from '../../lib/types';

interface SiteState {
	settings: SiteSettings | null;
	isLoading: boolean;
	lastUpdated: string | null;
}

interface SiteSettingsData {
	general?: {
		title?: string;
		description?: string;
		logo?: string;
		favicon?: string;
	};
	seo?: {
		defaultTitle?: string;
		defaultDescription?: string;
		defaultImage?: string;
	};
	social?: {
		twitter?: string;
		facebook?: string;
		instagram?: string;
		linkedin?: string;
		github?: string;
	};
	comments?: {
		enabled?: boolean;
		requireApproval?: boolean;
		allowGuestComments?: boolean;
		enableNotifications?: boolean;
	};
	analytics?: {
		googleAnalyticsId?: string;
		facebookPixelId?: string;
	};
	email?: {
		fromName?: string;
		fromEmail?: string;
		replyTo?: string;
	};
}

export const useSiteStore = defineStore('site', {
	state: (): SiteState => ({
		settings: null,
		isLoading: false,
		lastUpdated: null,
	}),

	getters: {
		title: (state): string => {
			return state.settings?.general?.title || 'Blog Platform';
		},

		description: (state): string => {
			return (
				state.settings?.general?.description ||
				'A modern multi-admin blog platform'
			);
		},

		logo: (state): string | null => {
			return state.settings?.general?.logo || null;
		},

		favicon: (state): string | null => {
			return state.settings?.general?.favicon || null;
		},

		seoDefaults: (state) => {
			return {
				title:
					state.settings?.seo?.defaultTitle ||
					'Blog Platform - Share Your Stories',
				description:
					state.settings?.seo?.defaultDescription ||
					'Discover amazing stories, insights, and knowledge from our community of writers.',
				image: state.settings?.seo?.defaultImage || '/og-image.png',
			};
		},

		socialLinks: (state) => {
			return state.settings?.social || {};
		},

		commentSettings: (state) => {
			return {
				enabled: state.settings?.comments?.enabled ?? true,
				requireApproval: state.settings?.comments?.requireApproval ?? true,
				allowGuestComments:
					state.settings?.comments?.allowGuestComments ?? true,
				enableNotifications:
					state.settings?.comments?.enableNotifications ?? true,
				...state.settings?.comments,
			};
		},

		analyticsSettings: (state) => {
			return state.settings?.analytics || {};
		},

		emailSettings: (state) => {
			return state.settings?.email || {};
		},
	},

	actions: {
		async loadSettings() {
			if (this.isLoading) return;

			this.isLoading = true;

			try {
				const { data } = await $fetch<{ data: SiteSettingsData }>(
					'/api/settings',
				);

				// Transform the settings data into our expected format
				this.settings = {
					general: data.general || {},
					seo: data.seo || {},
					social: data.social || {},
					comments: data.comments || {},
					analytics: data.analytics || {},
					email: data.email || {},
				};

				this.lastUpdated = new Date().toISOString();
			} catch (error) {
				console.error('Failed to load site settings:', error);
				// Set default settings on error
				this.settings = {
					general: {
						title: 'Blog Platform',
						description: 'A modern multi-admin blog platform',
					},
					seo: {
						defaultTitle: 'Blog Platform - Share Your Stories',
						defaultDescription:
							'Discover amazing stories, insights, and knowledge from our community of writers.',
						defaultImage: '/og-image.png',
					},
					social: {},
					comments: {
						enabled: true,
						requireApproval: true,
						allowGuestComments: true,
						enableNotifications: true,
					},
					analytics: {},
					email: {},
				};
			} finally {
				this.isLoading = false;
			}
		},

		async updateSettings(settingsData: Partial<SiteSettingsData>) {
			try {
				const { data } = await $fetch<{ data: SiteSettingsData }>(
					'/api/settings',
					{
						method: 'PUT',
						body: settingsData,
					},
				);

				// Update local state
				this.settings = {
					...this.settings,
					...data,
				};

				this.lastUpdated = new Date().toISOString();

				return data;
			} catch (error) {
				console.error('Failed to update site settings:', error);
				throw error;
			}
		},

		async updateGeneralSettings(generalSettings: SiteSettingsData['general']) {
			return this.updateSettings({ general: generalSettings });
		},

		async updateSeoSettings(seoSettings: SiteSettingsData['seo']) {
			return this.updateSettings({ seo: seoSettings });
		},

		async updateSocialSettings(socialSettings: SiteSettingsData['social']) {
			return this.updateSettings({ social: socialSettings });
		},

		async updateCommentSettings(commentSettings: SiteSettingsData['comments']) {
			return this.updateSettings({ comments: commentSettings });
		},

		async updateAnalyticsSettings(
			analyticsSettings: SiteSettingsData['analytics'],
		) {
			return this.updateSettings({ analytics: analyticsSettings });
		},

		async updateEmailSettings(emailSettings: SiteSettingsData['email']) {
			return this.updateSettings({ email: emailSettings });
		},

		// Clear settings (useful for logout or reset)
		clearSettings() {
			this.settings = null;
			this.lastUpdated = null;
		},

		// Get a specific setting value with fallback
		getSetting(path: string, defaultValue: any = null): any {
			if (!this.settings) return defaultValue;

			const keys = path.split('.');
			let current: any = this.settings;

			for (const key of keys) {
				if (current && typeof current === 'object' && key in current) {
					current = current[key];
				} else {
					return defaultValue;
				}
			}

			return current !== undefined ? current : defaultValue;
		},

		// Check if settings are loaded and fresh (within last 5 minutes)
		areSettingsFresh(): boolean {
			if (!this.settings || !this.lastUpdated) return false;

			const lastUpdate = new Date(this.lastUpdated);
			const now = new Date();
			const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

			return lastUpdate > fiveMinutesAgo;
		},

		// Force refresh settings if they're stale
		async refreshIfStale() {
			if (!this.areSettingsFresh()) {
				await this.loadSettings();
			}
		},
	},
});

// Auto-load settings on client-side
if (process.client) {
	const siteStore = useSiteStore();
	siteStore.loadSettings();
}
