<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuChildItem, NavigationMenuItem } from '@nuxt/ui';

const auth = useAuth();

// Close mobile menu on route change
const route = useRoute();
const { data: categoriesData, pending: categoriesLoading } = await useFetch('/api/categories', {
  query: {
    limit: 8,
    sortBy: 'posts',
    sortOrder: 'desc',
  },
});

const categories = computed(() => categoriesData.value?.data?.items || []);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'Posts',
    to: '/posts',
    icon: 'i-lucide-newspaper',
    active: route.path.startsWith('/posts'),
  },
  {
    label: 'Categories',
    to: '/categories',
    icon: 'i-lucide-box',
    active: route.path.startsWith('/categories'),
    children: categories.value.map((cat): NavigationMenuChildItem => {
      return {
        label: cat.name,
        description: cat.description ?? undefined,
        icon: 'i-lucide-group',
        to: `/categories/${cat.id}`,
      };
    }),
  },
  {
    icon: 'i-lucide-tags',
    label: 'Tags',
    to: '/tags',
  },
  {
    label: 'Authors',
    icon: 'i-lucide-user-star',
    to: '/authors',
    target: '_blank',
  },
]);

// Logout handler
const handleLogout = async () => {
  console.log('Logging out...');
  await auth.logout();
};

// User menu items
const userMenuItems = computed<DropdownMenuItem[]>(() => [
  {
    label: auth.user?.name || 'Profile',
    avatar: { src: auth.user?.avatarUrl },
    disabled: true,
  },

  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/profile',
  },
  ...(auth.canAccessAdmin
    ? [
        {
          label: 'Admin Dashboard',
          icon: 'i-lucide-settings',
          to: '/admin',
        },
      ]
    : []),

  {
    label: 'Sign Out',
    icon: 'i-lucide-log-out',
    onSelect: () => handleLogout(),
  },
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
        <HeaderSearch class="hidden sm:block" />
        <UColorModeSwitch />

        <!-- Auth buttons -->
        <template v-if="!auth.user">
          <ULink to="/auth">Sign..In</ULink>
        </template>

        <template v-else>
          <UDropdownMenu
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UAvatar
              :src="auth.user.avatarUrl"
              :alt="auth.user.name"
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
            v-if="!auth.user"
            class="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <NuxtLink
              to="/auth"
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
              <UAvatar
                :src="auth.user.avatarUrl"
                :alt="auth.user.name"
                size="sm"
              />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ auth.user.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ auth.user.email }}
                </p>
              </div>
            </div>

            <NuxtLink
              v-if="auth.canAccessAdmin"
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
