<!-- apps/web/pages/terms.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
      Terms of Service
    </h1>

    <div class="prose prose-lg dark:prose-invert max-w-none">
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Last updated: {{ lastUpdated }}
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using this website, you accept and agree to be bound by
        the terms and provision of this agreement.
      </p>

      <h2>User Accounts</h2>
      <p>
        When you create an account with us, you must provide information that is
        accurate, complete, and current at all times.
      </p>

      <h2>Content</h2>
      <p>
        Our service allows you to post, link, store, share and otherwise make
        available certain information, text, graphics, videos, or other
        material.
      </p>

      <h2>Prohibited Uses</h2>
      <p>
        You may not use our service for any unlawful purpose or to solicit
        others to perform unlawful acts.
      </p>

      <h2>Contact Information</h2>
      <p>
        Questions about the Terms of Service should be sent to us at
        <a href="mailto:legal@blogplatform.com">legal@blogplatform.com</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service',
  description: 'Terms and conditions for using our blog platform.',
});

const lastUpdated = 'January 1, 2024';
</script>
