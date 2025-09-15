<!-- apps/web/components/AdminHeader.vue -->
<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-bars-3"
            class="lg:hidden mr-2"
            @click="toggleSidebar"
            aria-label="Toggle sidebar"
          />

          <!-- Page title -->
          <div v-if="pageTitle" class="hidden sm:block">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ pageTitle }}
            </h1>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Quick actions -->
          <div class="hidden md:flex items-center space-x-2">
            <UButton
              to="/admin/posts/new"
              size="sm"
              icon="i-heroicons-plus"
              label="New Post"
            />
          </div>

          <!-- Notifications -->
          <AdminNotifications />

          <!-- Quick search -->
          <AdminQuickSearch />

          <!-- Theme toggle -->
          <ThemeToggle />

          <!-- User menu -->
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton variant="ghost" class="flex items-center space-x-2">
              <UAvatar 
                :src="user?.avatarUrl" 
                :alt="user?.name"
                size="sm"
              />
              <span class="hidden md:block text-sm font-medium">{{ user?.name }}</span>
              <UIcon name="i-heroicons-chevron-down" class="h-4 w-4" />
            </UButton>
          </UDropdown>
        </div>
      </div>
    </div>

    <!-- Secondary navigation (if any) -->
    <div v-if="$slots.nav" class="border-t border-gray-200 dark:border-gray-700">
      <div class="px-4 sm:px-6 lg:px-8">
        <slot name="nav" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const route = useRoute()

// Get page title from route meta or generate from path
const pageTitle = computed(() => {
  if (route.meta.title) return route.meta.title
  
  const segments = route.path.split('/').filter(Boolean)
  if (segments.length >= 2) {
    const section = segments[1]
    return section.charAt(0).toUpperCase() + section.slice(1)
  }
  
  return 'Dashboard'
})

// Sidebar toggle (injected from layout)
const toggleSidebar = inject('toggleSidebar', () => {})

// User menu items
const userMenuItems = computed(() => [
  [{
    label: user.value?.name || 'User',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'View Site',
    icon: 'i-heroicons-arrow-top-right-on-square',
    to: '/',
    target: '_blank'
  }, {
    label: 'Profile Settings',
    icon: 'i-heroicons-user',
    to: '/admin/profile'
  }],
  [{
    label: 'Help & Support',
    icon: 'i-heroicons-question-mark-circle',
    to: '/admin/help'
  }, {
    label: 'Keyboard Shortcuts',
    icon: 'i-heroicons-command-line',
    click: () => {
      // Show keyboard shortcuts modal
    }
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: async () => {
      await authStore.logout()
      await navigateTo('/auth/login')
    }
  }]
])
</script>

<!-- apps/web/components/AdminNotifications.vue -->
<template>
  <UDropdown :items="notificationItems" :popper="{ placement: 'bottom-end' }">
    <UButton 
      variant="ghost" 
      size="sm" 
      icon="i-heroicons-bell"
      :class="hasUnread ? 'text-primary-600' : 'text-gray-500'"
      class="relative"
    >
      <!-- Unread indicator -->
      <span 
        v-if="hasUnread"
        class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"
      />
    </UButton>
  </UDropdown>
</template>

<script setup lang="ts">
// Mock notifications - in real app, fetch from API
const notifications = ref([
  {
    id: '1',
    type: 'comment',
    title: 'New comment on your post',
    message: 'John Doe commented on "Getting Started with TypeScript"',
    time: '2 minutes ago',
    read: false,
    action: () => navigateTo('/admin/comments')
  },
  {
    id: '2',
    type: 'post',
    title: 'Post published successfully',
    message: 'Your post "Modern CSS Layout" is now live',
    time: '1 hour ago',
    read: false,
    action: () => navigateTo('/admin/posts')
  },
  {
    id: '3',
    type: 'user',
    title: 'New user registered',
    message: 'Jane Smith just joined the platform',
    time: '3 hours ago',
    read: true,
    action: () => navigateTo('/admin/users')
  }
])

const hasUnread = computed(() => 
  notifications.value.some(n => !n.read)
)

const notificationItems = computed(() => {
  const items = []
  
  // Header
  items.push([{
    label: 'Notifications',
    slot: 'header',
    disabled: true
  }])
  
  // Notifications
  if (notifications.value.length > 0) {
    const notificationItems = notifications.value.slice(0, 5).map(notification => ({
      label: notification.title,
      description: notification.message,
      icon: getNotificationIcon(notification.type),
      click: notification.action,
      class: notification.read ? 'opacity-75' : ''
    }))
    
    items.push(notificationItems)
    
    // View all link
    items.push([{
      label: 'View all notifications',
      icon: 'i-heroicons-arrow-right',
      to: '/admin/notifications'
    }])
  } else {
    items.push([{
      label: 'No new notifications',
      disabled: true,
      icon: 'i-heroicons-bell-slash'
    }])
  }
  
  return items
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment': return 'i-heroicons-chat-bubble-left'
    case 'post': return 'i-heroicons-document-text'
    case 'user': return 'i-heroicons-user'
    default: return 'i-heroicons-bell'
  }
}
</script>

<!-- apps/web/components/AdminQuickSearch.vue -->
<template>
  <div class="relative">
    <UInput
      v-model="searchQuery"
      placeholder="Quick search..."
      icon="i-heroicons-magnifying-glass"
      size="sm"
      class="w-64"
      @focus="showResults = true"
      @blur="hideResults"
    />

    <!-- Search results -->
    <div 
      v-if="showResults && searchQuery.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      <div class="py-2">
        <div v-if="searchResults.length > 0" class="space-y-1">
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
            @click="navigateToResult(result)"
          >
            <UIcon :name="result.icon" class="h-4 w-4 text-gray-400" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ result.title }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ result.type }}
              </p>
            </div>
          </button>
        </div>
        
        <div v-else class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const showResults = ref(false)
const searchResults = ref<Array<{
  id: string
  title: string
  type: string
  icon: string
  path: string
}>>([])

// Debounced search
const debouncedSearch = useDebounceFn(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const { data } = await $fetch('/api/admin/search', {
      query: { q: searchQuery.value }
    })
    searchResults.value = data || []
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  }
}, 300)

watch(searchQuery, debouncedSearch)

const hideResults = () => {
  setTimeout(() => {
    showResults.value = false
  }, 150)
}

const navigateToResult = (result: typeof searchResults.value[0]) => {
  navigateTo(result.path)
  showResults.value = false
  searchQuery.value = ''
}
</script>
