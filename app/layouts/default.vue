<template>
  <div>
    <!-- Skip to content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
    <PublicHeader />
    <UMain id="main-content">
      <slot />
    </UMain>
    <LogoSeparator />
    <PublicFooter />
  </div>
</template>
