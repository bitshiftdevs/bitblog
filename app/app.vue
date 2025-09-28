<template>
  <UApp>
    <NuxtLoadingIndicator :height="4" :duration="300" :throttle="0" />
    <Transition name="page" mode="out-in">
      <div
        v-if="pending"
        class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div class="flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </Transition>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// Global meta tags
useHead({
  titleTemplate: (title) => {
    return title ? `${title} - BitBlog` : 'BitBlog';
  },
  meta: [
    { name: 'description', content: 'A  blog site for BitShift' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'BitBlog' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
});
const pending = ref(false);

// Global loading state
// const { pending } = useLazyAsyncData('app-init', () => {
//   // Initialize app data here if needed
//   return Promise.resolve();
// });

// Global error handling
onErrorCaptured((error) => {
  console.error('Global error:', error);
  // You can send errors to tracking service here
  return false;
});

// Service Worker registration for PWA
// if (import.meta.client && 'serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/sw.js');
// }

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

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Layout transitions */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.2s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

.layout-enter-to,
.layout-leave-from {
  opacity: 1;
}
</style>
