<template>
  <header
    class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and site title -->
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
              <UIcon
                name="i-heroicons-pencil-square"
                class="h-5 w-5 text-white"
              />
            </div>
            <span>{{ siteSettings?.title || "Blog Platform" }}</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink
            to="/"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Home
          </NuxtLink>

          <NuxtLink
            to="/posts"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Posts
          </NuxtLink>

          <UDropdown
            :items="categoryItems"
            :popper="{ placement: 'bottom-start' }"
          >
            <UButton
              variant="ghost"
              color="gray"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Categories
            </UButton>
          </UDropdown>

          <NuxtLink
            to="/tags"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Tags
          </NuxtLink>

          <NuxtLink
            to="/authors"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Authors
          </NuxtLink>
        </nav>

        <!-- Search and Actions -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="hidden sm:block">
            <HeaderSearch />
          </div>

          <!-- Theme toggle -->
          <ThemeToggle />

          <!-- Auth buttons -->
          <template v-if="!user">
            <NuxtLink
              to="/auth/login"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </NuxtLink>
          </template>

          <template v-else>
            <UDropdown
              :items="userMenuItems"
              :popper="{ placement: 'bottom-end' }"
            >
              <UAvatar
                :src="user.avatarUrl"
                :alt="user.name"
                size="sm"
                class="cursor-pointer"
              />
            </UDropdown>
          </template>

          <!-- Mobile menu button -->
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-bars-3"
            class="md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle mobile menu"
          />
        </div>
      </div>

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
    </div>
  </header>
</template>

<script setup lang="ts">
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

// Logout handler
const handleLogout = async () => {
	await authStore.logout();
	mobileMenuOpen.value = false;
	await navigateTo('/');
};

// Category dropdown items
const { data: categories } = await useFetch('/api/categories', {
	query: { limit: 10 },
});

const categoryItems = computed(() => {
	if (!categories.value?.data?.items) return [];

	return [
		[
			{
				label: 'All Categories',
				to: '/categories',
				icon: 'i-heroicons-folder-open',
			},
		],
		...categories.value.data.items.map((category) => ({
			label: category.name,
			to: `/categories/${category.slug}`,
			badge: category._count?.posts,
		})),
	];
});

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
			icon: 'i-heroicons-user',
			to: '/profile',
		},
	],
	...(canAccessAdmin.value
		? [
				{
					label: 'Admin Dashboard',
					icon: 'i-heroicons-cog-6-tooth',
					to: '/admin',
				},
			]
		: []),
	[
		{
			label: 'Sign Out',
			icon: 'i-heroicons-arrow-right-on-rectangle',
			click: handleLogout,
		},
	],
]);

// Load site settings on mount
onMounted(() => {
	siteStore.loadSettings();
});
</script>
