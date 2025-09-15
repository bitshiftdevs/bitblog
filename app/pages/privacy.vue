<!-- apps/web/pages/privacy.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
      Privacy Policy
    </h1>

    <div class="prose prose-lg dark:prose-invert max-w-none">
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Last updated: {{ lastUpdated }}
      </p>

      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you
        create an account, subscribe to our newsletter, or contact us.
      </p>

      <h2>How We Use Your Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our
        services, communicate with you, and comply with legal obligations.
      </p>

      <h2>Information Sharing</h2>
      <p>
        We do not sell, trade, or otherwise transfer your personal information
        to third parties without your consent, except as described in this
        policy.
      </p>

      <h2>Data Security</h2>
      <p>
        We implement appropriate security measures to protect your personal
        information against unauthorized access, alteration, disclosure, or
        destruction.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at
        <a href="mailto:privacy@blogplatform.com">privacy@blogplatform.com</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy',
  description:
    'Our privacy policy explains how we collect, use, and protect your information.',
});

const lastUpdated = 'January 1, 2024';
</script>
