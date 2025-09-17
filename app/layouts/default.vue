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
  </div>
</template>
