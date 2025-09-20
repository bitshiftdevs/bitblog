<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const user = computed(() => authStore.user);
const canAccessAdmin = computed(() => authStore.canAccessAdmin);

// Close mobile menu on route change
const route = useRoute();

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
  console.log('Logging out...');
  await authStore.logout();
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
      icon: 'i-lucide-log-out',
      click: handleLogout,
    },
  ],
]);
</script>
<template>
  <UHeader mode="drawer" :menu="{ direction: 'top', inset: true }">
    <template #title>
      <NuxtImg src="/favicon.ico" class="h-6 w-auto" format="webp" />
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
          <ULink to="/auth/login">Sign..In</ULink>
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
      </div>
    </template>
    <template #body>
      <div class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
        <nav class="flex flex-col space-y-4">
          <!-- Mobile search -->
          <div class="sm:hidden px-2">
            <HeaderSearch />
          </div>

          <NuxtLink
            to="/"
            class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </NuxtLink>

          <NuxtLink
            to="/posts"
            class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Posts
          </NuxtLink>

          <NuxtLink
            to="/categories"
            class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Categories
          </NuxtLink>

          <NuxtLink
            to="/tags"
            class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Tags
          </NuxtLink>

          <NuxtLink
            to="/authors"
            class="block px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            >
              Sign In
            </NuxtLink>
          </div>

          <div
            v-else
            class="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
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
    </template>
  </UHeader>
</template>
