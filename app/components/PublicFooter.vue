<!-- apps/web/components/PublicFooter.vue -->
<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <img
              v-if="siteSettings?.logo"
              :src="siteSettings.logo"
              :alt="`${siteSettings.title} Logo`"
              class="h-8 w-8"
            />
            <div
              v-else
              class="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-pencil-square"
                class="h-5 w-5 text-white"
              />
            </div>
            <span class="text-xl font-bold">{{
              siteSettings?.title || "BitBlog"
            }}</span>
          </div>

          <p class="text-gray-300 mb-6 max-w-md">
            {{
              siteSettings?.description ||
              "Blog Platform for BitShift for sharing amazing stories and insights."
            }}
          </p>

          <!-- Social Links -->
          <div class="flex space-x-4">
            <UButton
              v-if="socialLinks.twitter"
              :to="socialLinks.twitter"
              target="_blank"
              variant="ghost"
              icon="i-simple-icons-twitter"
              size="sm"
              color="primary"
              aria-label="Twitter"
            />
            <UButton
              v-if="socialLinks.facebook"
              :to="socialLinks.facebook"
              target="_blank"
              variant="ghost"
              icon="i-simple-icons-facebook"
              size="sm"
              color="primary"
              aria-label="Facebook"
            />
            <UButton
              v-if="socialLinks.instagram"
              :to="socialLinks.instagram"
              target="_blank"
              variant="ghost"
              icon="i-simple-icons-instagram"
              size="sm"
              color="primary"
              aria-label="Instagram"
            />
            <UButton
              v-if="socialLinks.linkedin"
              :to="socialLinks.linkedin"
              target="_blank"
              variant="ghost"
              icon="i-simple-icons-linkedin"
              size="sm"
              color="primary"
              aria-label="LinkedIn"
            />
            <UButton
              v-if="socialLinks.github"
              :to="socialLinks.github"
              target="_blank"
              variant="ghost"
              icon="i-simple-icons-github"
              size="sm"
              color="primary"
              aria-label="GitHub"
            />
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold mb-4">Quick Links</h3>
          <ul class="space-y-2 text-gray-300">
            <li>
              <NuxtLink to="/" class="hover:text-white transition-colors"
                >Home</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/posts" class="hover:text-white transition-colors"
                >Posts</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/categories"
                class="hover:text-white transition-colors"
                >Categories</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/authors" class="hover:text-white transition-colors"
                >Authors</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/tags" class="hover:text-white transition-colors"
                >Tags</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h3 class="font-semibold mb-4">Legal</h3>
          <ul class="space-y-2 text-gray-300">
            <li>
              <NuxtLink to="/privacy" class="hover:text-white transition-colors"
                >Privacy Policy</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-white transition-colors"
                >Terms of Service</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/contact" class="hover:text-white transition-colors"
                >Contact</NuxtLink
              >
            </li>
            <!-- <li><NuxtLink to="/sitemap.xml" class="hover:text-white transition-colors">Sitemap</NuxtLink></li> -->
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center"
      >
        <p class="text-gray-400 text-sm">
          © {{ new Date().getFullYear() }}
          {{ siteSettings?.title || "BitBlog" }}. All rights reserved.
        </p>

        <div class="flex items-center space-x-4 mt-4 sm:mt-0">
          <!-- <NuxtLink -->
          <!--   to="/rss.xml" -->
          <!--   class="text-gray-400 hover:text-white transition-colors text-sm" -->
          <!-- > -->
          <!--   RSS Feed -->
          <!-- </NuxtLink> -->
          <span class="text-gray-600">•</span>
          <span class="text-gray-400 text-sm"> Built with ❤ using Nuxt </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useSiteStore } from '~/stores/site';

const siteStore = useSiteStore();
const siteSettings = computed(() => siteStore.settings);
const socialLinks = computed(() => siteStore.socialLinks);
</script>
