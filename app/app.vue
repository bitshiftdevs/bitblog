<template>
  <UApp>
    <!-- Global modals -->
    <UModal />

    <!-- Main app layout -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Loading overlay -->
    <UProgress
      v-if="pending"
      animation="carousel"
      class="fixed top-0 left-0 right-0 z-50"
    />
  </UApp>
</template>

<script setup lang="ts">
// Global meta tags
useHead({
  titleTemplate: (title) => {
    return title ? `${title} - BitBlog` : 'BitBlog';
  },
  meta: [
    { name: 'description', content: 'A modern multi-admin blog platform' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'BitBlog' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
});

// Global loading state
const { pending } = useLazyAsyncData('app-init', () => {
  // Initialize app data here if needed
  return Promise.resolve();
});

// Global error handling
onErrorCaptured((error) => {
  console.error('Global error:', error);
  // You can send errors to tracking service here
  return false;
});

// Service Worker registration for PWA
if (process.client && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Global CSS variables from site settings
const colorMode = useColorMode();

// Initialize theme from user preference or system
onMounted(() => {
  // Set initial color mode if not set
  if (!colorMode.preference) {
    colorMode.preference = 'system';
  }
});
</script>
