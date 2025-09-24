<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();

// Mock SEO settings data
const seoSettings = ref({
  general: {
    siteTitle: 'My Amazing Blog',
    siteDescription: 'A blog about technology, programming, and digital innovation',
    defaultImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
    siteUrl: 'https://myamazingblog.com',
    language: 'en-US'
  },
  metadata: {
    titleTemplate: '%s | My Amazing Blog',
    titleSeparator: '|',
    maxTitleLength: 60,
    maxDescriptionLength: 160
  },
  social: {
    twitterCard: 'summary_large_image',
    twitterSite: '@myamazingblog',
    facebookAppId: '',
    ogType: 'website'
  },
  technical: {
    enableSitemap: true,
    enableRobotsTxt: true,
    enableJsonLd: true,
    enableBreadcrumbs: true,
    enableCanonicalUrls: true
  },
  analytics: {
    googleAnalyticsId: 'GA-XXXXXXXXXX',
    googleTagManagerId: 'GTM-XXXXXXX',
    facebookPixelId: '',
    enableCookieConsent: true
  }
});

const isLoading = ref(false);

const saveSettings = async () => {
  isLoading.value = true;

  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.add({
      title: 'Success',
      description: 'SEO settings updated successfully',
      color: 'success'
    });
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update SEO settings',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
  }
};

const resetSettings = () => {
  const confirmed = confirm('Are you sure you want to reset all SEO settings to defaults?');
  if (!confirmed) return;

  // Reset to defaults
  seoSettings.value = {
    general: {
      siteTitle: '',
      siteDescription: '',
      defaultImage: '',
      siteUrl: '',
      language: 'en-US'
    },
    metadata: {
      titleTemplate: '%s | Site Name',
      titleSeparator: '|',
      maxTitleLength: 60,
      maxDescriptionLength: 160
    },
    social: {
      twitterCard: 'summary_large_image',
      twitterSite: '',
      facebookAppId: '',
      ogType: 'website'
    },
    technical: {
      enableSitemap: true,
      enableRobotsTxt: true,
      enableJsonLd: true,
      enableBreadcrumbs: true,
      enableCanonicalUrls: true
    },
    analytics: {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
      enableCookieConsent: true
    }
  };

  toast.add({
    title: 'Settings Reset',
    description: 'SEO settings have been reset to defaults',
    color: 'yellow'
  });
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'SEO' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          SEO Settings
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Configure search engine optimization and metadata settings
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton
          @click="resetSettings"
          color="gray"
          variant="outline"
          size="sm"
        >
          Reset to Defaults
        </UButton>
        <UButton
          @click="saveSettings"
          :loading="isLoading"
          size="sm"
        >
          Save Settings
        </UButton>
      </div>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <!-- General Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">General SEO Settings</h3>
        </template>

        <div class="grid grid-cols-1 gap-6">
          <UFormField label="Site Title" required>
            <UInput
              v-model="seoSettings.general.siteTitle"
              placeholder="Your site title"
              required
            />
            <template #description>
              This will be used as the default title for your site
            </template>
          </UFormField>

          <UFormField label="Site Description" required>
            <UTextarea
              v-model="seoSettings.general.siteDescription"
              placeholder="A brief description of your site"
              :rows="3"
              :maxlength="160"
              required
            />
            <template #description>
              {{ seoSettings.general.siteDescription.length }}/160 characters
            </template>
          </UFormField>

          <UFormField label="Default Social Image">
            <UInput
              v-model="seoSettings.general.defaultImage"
              type="url"
              placeholder="https://example.com/image.jpg"
            />
            <template #description>
              Used when pages don't have a specific social image (1200x630px recommended)
            </template>
          </UFormField>

          <UFormField label="Site URL" required>
            <UInput
              v-model="seoSettings.general.siteUrl"
              type="url"
              placeholder="https://yoursite.com"
              required
            />
          </UFormField>

          <UFormField label="Site Language">
            <USelectMenu
              v-model="seoSettings.general.language"
              :options="[
                { label: 'English (US)', value: 'en-US' },
                { label: 'English (UK)', value: 'en-GB' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' }
              ]"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Metadata Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Metadata Settings</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Title Template">
            <UInput
              v-model="seoSettings.metadata.titleTemplate"
              placeholder="%s | Site Name"
            />
            <template #description>
              Use %s as placeholder for page title
            </template>
          </UFormField>

          <UFormField label="Title Separator">
            <USelectMenu
              v-model="seoSettings.metadata.titleSeparator"
              :options="[
                { label: '| (Pipe)', value: '|' },
                { label: '- (Dash)', value: '-' },
                { label: '• (Bullet)', value: '•' },
                { label: ':: (Double Colon)', value: '::' }
              ]"
            />
          </UFormField>

          <UFormField label="Max Title Length">
            <UInput
              v-model.number="seoSettings.metadata.maxTitleLength"
              type="number"
              min="30"
              max="100"
            />
            <template #description>
              Recommended: 50-60 characters
            </template>
          </UFormField>

          <UFormField label="Max Description Length">
            <UInput
              v-model.number="seoSettings.metadata.maxDescriptionLength"
              type="number"
              min="120"
              max="200"
            />
            <template #description>
              Recommended: 150-160 characters
            </template>
          </UFormField>
        </div>
      </UCard>

      <!-- Social Media -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Social Media Integration</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Twitter Card Type">
            <USelectMenu
              v-model="seoSettings.social.twitterCard"
              :options="[
                { label: 'Summary Large Image', value: 'summary_large_image' },
                { label: 'Summary', value: 'summary' }
              ]"
            />
          </UFormField>

          <UFormField label="Twitter Site Handle">
            <UInput
              v-model="seoSettings.social.twitterSite"
              placeholder="@yoursite"
            />
          </UFormField>

          <UFormField label="Facebook App ID">
            <UInput
              v-model="seoSettings.social.facebookAppId"
              placeholder="123456789"
            />
          </UFormField>

          <UFormField label="Open Graph Type">
            <USelectMenu
              v-model="seoSettings.social.ogType"
              :options="[
                { label: 'Website', value: 'website' },
                { label: 'Article', value: 'article' },
                { label: 'Blog', value: 'blog' }
              ]"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Technical SEO -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Technical SEO</h3>
        </template>

        <div class="space-y-4">
          <UCheckbox
            v-model="seoSettings.technical.enableSitemap"
            label="Generate XML Sitemap"
            description="Automatically generate and update XML sitemap"
          />

          <UCheckbox
            v-model="seoSettings.technical.enableRobotsTxt"
            label="Generate robots.txt"
            description="Automatically generate robots.txt file"
          />

          <UCheckbox
            v-model="seoSettings.technical.enableJsonLd"
            label="Enable JSON-LD Structured Data"
            description="Add structured data markup for better search engine understanding"
          />

          <UCheckbox
            v-model="seoSettings.technical.enableBreadcrumbs"
            label="Enable Breadcrumb Schema"
            description="Add breadcrumb structured data to pages"
          />

          <UCheckbox
            v-model="seoSettings.technical.enableCanonicalUrls"
            label="Enable Canonical URLs"
            description="Automatically add canonical URLs to prevent duplicate content"
          />
        </div>
      </UCard>

      <!-- Analytics & Tracking -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Analytics & Tracking</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Google Analytics ID">
            <UInput
              v-model="seoSettings.analytics.googleAnalyticsId"
              placeholder="GA-XXXXXXXXXX or G-XXXXXXXXXX"
            />
          </UFormField>

          <UFormField label="Google Tag Manager ID">
            <UInput
              v-model="seoSettings.analytics.googleTagManagerId"
              placeholder="GTM-XXXXXXX"
            />
          </UFormField>

          <UFormField label="Facebook Pixel ID">
            <UInput
              v-model="seoSettings.analytics.facebookPixelId"
              placeholder="123456789"
            />
          </UFormField>

          <div class="md:col-span-2">
            <UCheckbox
              v-model="seoSettings.analytics.enableCookieConsent"
              label="Enable Cookie Consent"
              description="Show cookie consent banner for GDPR compliance"
            />
          </div>
        </div>
      </UCard>

      <!-- Preview -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Search Result Preview</h3>
        </template>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div class="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
            {{ seoSettings.general.siteTitle || 'Your Site Title' }}
          </div>
          <div class="text-green-700 dark:text-green-400 text-sm">
            {{ seoSettings.general.siteUrl || 'https://yoursite.com' }}
          </div>
          <div class="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {{ seoSettings.general.siteDescription || 'Your site description will appear here...' }}
          </div>
        </div>
      </UCard>
    </form>
  </div>
</template>