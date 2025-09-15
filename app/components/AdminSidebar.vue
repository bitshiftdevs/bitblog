<!-- apps/web/components/AdminSidebar.vue -->
<template>
  <!-- Mobile sidebar overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
    @click="$emit('close')"
  />

  <!-- Sidebar -->
  <div 
    class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-4 bg-gray-800">
        <NuxtLink to="/admin" class="flex items-center space-x-2">
          <div class="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center">
            <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5 text-white" />
          </div>
          <span class="text-white font-semibold">Admin Panel</span>
        </NuxtLink>
        
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          class="lg:hidden text-gray-400 hover:text-white"
          @click="$emit('close')"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <!-- Dashboard -->
        <SidebarItem
          to="/admin"
          icon="i-heroicons-home"
          label="Dashboard"
          :exact="true"
        />

        <!-- Content Management -->
        <SidebarSection title="Content">
          <SidebarItem
            to="/admin/posts"
            icon="i-heroicons-document-text"
            label="Posts"
            :badge="postStats.draft > 0 ? postStats.draft : undefined"
          />
          
          <SidebarItem
            to="/admin/pages"
            icon="i-heroicons-document"
            label="Pages"
          />
          
          <SidebarItem
            to="/admin/categories"
            icon="i-heroicons-folder"
            label="Categories"
          />
          
          <SidebarItem
            to="/admin/tags"
            icon="i-heroicons-tag"
            label="Tags"
          />
        </SidebarSection>

        <!-- Media -->
        <SidebarSection title="Media">
          <SidebarItem
            to="/admin/media"
            icon="i-heroicons-photo"
            label="Media Library"
          />
        </SidebarSection>

        <!-- Engagement -->
        <SidebarSection title="Engagement">
          <SidebarItem
            to="/admin/comments"
            icon="i-heroicons-chat-bubble-left-right"
            label="Comments"
            :badge="commentStats.pending > 0 ? commentStats.pending : undefined"
          />
          
          <SidebarItem
            to="/admin/newsletter"
            icon="i-heroicons-envelope"
            label="Newsletter"
          />
        </SidebarSection>

        <!-- Users (Admin only) -->
        <SidebarSection 
          v-if="canManageUsers" 
          title="Users"
        >
          <SidebarItem
            to="/admin/users"
            icon="i-heroicons-users"
            label="All Users"
          />
          
          <SidebarItem
            to="/admin/roles"
            icon="i-heroicons-shield-check"
            label="Roles & Permissions"
          />
          
          <SidebarItem
            to="/admin/invitations"
            icon="i-heroicons-user-plus"
            label="Invitations"
            :badge="invitationStats.pending > 0 ? invitationStats.pending : undefined"
          />
        </SidebarSection>

        <!-- Analytics -->
        <SidebarSection title="Analytics">
          <SidebarItem
            to="/admin/analytics"
            icon="i-heroicons-chart-bar"
            label="Analytics"
          />
          
          <SidebarItem
            to="/admin/reports"
            icon="i-heroicons-document-chart-bar"
            label="Reports"
          />
        </SidebarSection>

        <!-- Settings (Admin only) -->
        <SidebarSection 
          v-if="canManageSettings" 
          title="Settings"
        >
          <SidebarItem
            to="/admin/settings"
            icon="i-heroicons-cog-6-tooth"
            label="Site Settings"
          />
          
          <SidebarItem
            to="/admin/settings/seo"
            icon="i-heroicons-magnifying-glass"
            label="SEO Settings"
          />
          
          <SidebarItem
            to="/admin/settings/integrations"
            icon="i-heroicons-puzzle-piece"
            label="Integrations"
          />
        </SidebarSection>

        <!-- System -->
        <SidebarSection 
          v-if="canManageSystem" 
          title="System"
        >
          <SidebarItem
            to="/admin/audit-logs"
            icon="i-heroicons-clipboard-document-list"
            label="Audit Logs"
          />
          
          <SidebarItem
            to="/admin/backups"
            icon="i-heroicons-archive-box"
            label="Backups"
          />
        </SidebarSection>
      </nav>

      <!-- User info -->
      <div class="flex-shrink-0 border-t border-gray-700 p-4">
        <div class="flex items-center">
          <UAvatar 
            :src="user?.avatarUrl" 
            :alt="user?.name"
            size="sm"
          />
          <div class="ml-3 flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ user?.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
          </div>
          
          <UDropdown :items="userMenuItems" :popper="{ placement: 'top-end' }">
            <UButton 
              variant="ghost" 
              size="sm" 
              icon="i-heroicons-ellipsis-vertical"
              class="text-gray-400 hover:text-white"
            />
          </UDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Permission checks
const canManageUsers = computed(() => 
  authStore.hasPermission('users.manage') || authStore.hasPermission('admin')
)

const canManageSettings = computed(() => 
  authStore.hasPermission('settings.write') || authStore.hasPermission('admin')
)

const canManageSystem = computed(() => 
  authStore.hasPermission('admin')
)

// Stats for badges (would be fetched from API)
const postStats = ref({ draft: 0, scheduled: 0 })
const commentStats = ref({ pending: 0 })
const invitationStats = ref({ pending: 0 })

// Fetch stats
const { data: statsData } = await useFetch('/api/admin/stats')
if (statsData.value?.data) {
  postStats.value = statsData.value.data.posts || postStats.value
  commentStats.value = statsData.value.data.comments || commentStats.value
  invitationStats.value = statsData.value.data.invitations || invitationStats.value
}

// User menu items
const userMenuItems = computed(() => [
  [{
    label: 'View Site',
    icon: 'i-heroicons-arrow-top-right-on-square',
    to: '/',
    target: '_blank'
  }],
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    to: '/admin/profile'
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

<!-- apps/web/components/SidebarSection.vue -->
<template>
  <div class="mb-4">
    <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {{ title }}
    </h3>
    <div class="space-y-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<!-- apps/web/components/SidebarItem.vue -->
<template>
  <NuxtLink
    :to="to"
    :exact="exact"
    class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
    :class="isActive ? activeClasses : inactiveClasses"
  >
    <UIcon 
      :name="icon" 
      class="mr-3 h-5 w-5 flex-shrink-0"
      :class="isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'"
    />
    
    <span class="flex-1">{{ label }}</span>
    
    <UBadge 
      v-if="badge" 
      :label="badge.toString()"
      size="xs"
      variant="solid"
      color="red"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string
  icon: string
  label: string
  badge?: number
  exact?: boolean
}

withDefaults(defineProps<Props>(), {
  exact: false
})

const route = useRoute()

const isActive = computed(() => {
  if (props.exact) {
    return route.path === props.to
  }
  return route.path.startsWith(props.to)
})

const activeClasses = 'bg-gray-800 text-white'
const inactiveClasses = 'text-gray-300 hover:bg-gray-700 hover:text-white'
</script>
