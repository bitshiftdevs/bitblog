<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Skip to content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>

    <!-- Header -->
    <PublicHeader />

    <!-- Main content -->
    <main id="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <PublicFooter />

    <!-- Back to top button -->
    <UButton
      v-show="showBackToTop"
      icon="i-heroicons-chevron-up"
      size="lg"
      class="fixed bottom-6 right-6 z-40"
      variant="solid"
      color="primary"
      @click="scrollToTop"
      aria-label="Back to top"
    />
  </div>
</template>

<script setup lang="ts">
// Back to top functionality
const showBackToTop = ref(false);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
</script>
