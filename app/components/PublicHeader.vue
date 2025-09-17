<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAuthStore } from '~/stores/auth';
import { useSiteStore } from '~/stores/site';

const authStore = useAuthStore();
const siteStore = useSiteStore();

const user = computed(() => authStore.user);
const canAccessAdmin = computed(() => authStore.canAccessAdmin);
const siteSettings = computed(() => siteStore.settings);

const mobileMenuOpen = ref(false);

// Close mobile menu on route change
const route = useRoute();
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
  },
);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'Posts',
    to: '/posts',
    active: route.path.startsWith('/posts'),
  },
  {
    label: 'Categories',
    to: '/categories',
    active: route.path.startsWith('/categories'),
  },
  {
    label: 'Tags',
    to: '/tags',
    target: '_blank',
  },
  {
    label: 'Authors',
    to: '/authors',
    target: '_blank',
  },
]);

// Logout handler
const handleLogout = async () => {
  await authStore.logout();
  mobileMenuOpen.value = false;
  await navigateTo('/');
};

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: user.value?.name || 'Profile',
      avatar: { src: user.value?.avatarUrl },
      disabled: true,
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ],
  ...(canAccessAdmin.value
    ? [
        {
          label: 'Admin Dashboard',
          icon: 'i-lucide-settings',
          to: '/admin',
        },
      ]
    : []),
  [
    {
      label: 'Sign Out',
      icon: 'i-lucide-arrow-right-on-rectangle',
      click: handleLogout,
    },
  ],
]);
</script>
<template>
  <UHeader>
    <template #title>
      <div class="flex items-center">
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
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
            <UIcon name="i-lucide-square-pen" class="h-5 w-5 text-white" />
          </div>
          <span>{{ siteSettings?.title || "BitBlog" }}</span>
        </NuxtLink>
      </div>
    </template>

    <UNavigationMenu :items="navItems" />
    <template #right>
      <!-- Search and Actions -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden sm:block">
          <HeaderSearch />
        </div>
        <UColorModeSwitch />

        <!-- Auth buttons -->
        <template v-if="!user">
          <ULink to="/auth/login" class="text-sm">Sign..In</ULink>
        </template>

        <template v-else>
          <UDropdownMenu
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UAvatar
              :src="user.avatarUrl"
              :alt="user.name"
              size="sm"
              class="cursor-pointer"
            />
          </UDropdownMenu>
        </template>

        <!-- Mobile menu button -->
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-menu"
          class="md:hidden"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle mobile menu"
        />
      </div>
    </template>

    <!-- Mobile menu -->
    <div
      v-show="mobileMenuOpen"
      class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
    >
      <nav class="flex flex-col space-y-4">
        <!-- Mobile search -->
        <div class="sm:hidden px-2">
          <HeaderSearch />
        </div>

        <NuxtLink
          to="/"
          class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="mobileMenuOpen = false"
        >
          Home
        </NuxtLink>

        <NuxtLink
          to="/posts"
          class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="mobileMenuOpen = false"
        >
          Posts
        </NuxtLink>

        <NuxtLink
          to="/categories"
          class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="mobileMenuOpen = false"
        >
          Categories
        </NuxtLink>

        <NuxtLink
          to="/tags"
          class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="mobileMenuOpen = false"
        >
          Tags
        </NuxtLink>

        <NuxtLink
          to="/authors"
          class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="mobileMenuOpen = false"
        >
          Authors
        </NuxtLink>

        <!-- Mobile auth -->
        <div
          v-if="!user"
          class="border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <NuxtLink
            to="/auth/login"
            class="block px-2 py-1 text-primary-600 dark:text-primary-400 font-medium"
            @click="mobileMenuOpen = false"
          >
            Sign In
          </NuxtLink>
        </div>

        <div v-else class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div class="flex items-center space-x-3 px-2 py-1">
            <UAvatar :src="user.avatarUrl" :alt="user.name" size="sm" />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ user.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ user.email }}
              </p>
            </div>
          </div>

          <NuxtLink
            v-if="canAccessAdmin"
            to="/admin"
            class="block px-2 py-1 mt-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            @click="mobileMenuOpen = false"
          >
            Admin Dashboard
          </NuxtLink>

          <button
            @click="handleLogout"
            class="block w-full text-left px-2 py-1 mt-2 text-red-600 dark:text-red-400"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  </UHeader>
</template>
