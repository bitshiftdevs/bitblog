<script setup lang="ts">
// Middleware to protect admin routes
definePageMeta({
  middleware: ['auth', 'admin'],
});

// Sidebar state
const sidebarOpen = ref(false);

// Provide sidebar toggle function to child components
provide('toggleSidebar', () => {
  sidebarOpen.value = !sidebarOpen.value;
});

// Breadcrumbs state
const breadcrumbs = ref<Array<{ label: string; to?: string }>>([]);

// Provide breadcrumb management
provide('setBreadcrumbs', (items: Array<{ label: string; to?: string }>) => {
  breadcrumbs.value = items;
});

// Close sidebar on route change (mobile)
const route = useRoute();
watch(
  () => route.path,
  () => {
    if (process.client && window.innerWidth < 1024) {
      sidebarOpen.value = false;
    }
  },
);

// Handle window resize
const handleResize = () => {
  if (process.client && window.innerWidth >= 1024) {
    sidebarOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// SEO for admin pages
useSeoMeta({
  title: 'Admin Dashboard',
  description: 'BitBlog Admin Dashboard',
  robots: 'noindex, nofollow',
});
</script>
<!-- apps/web/layouts/admin.vue -->
<template>
  <div>
    <AdminHeader />
    <UDashboardGroup>
      <!-- Admin Header -->

      <AdminSidebar />
      <!-- Main content area -->
      <div class="flex-1 min-w-0">
        <!-- Mobile sidebar overlay -->
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          @click="sidebarOpen = false"
        />

        <!-- Content wrapper -->
        <div>
          <!-- Page header -->
          <div v-if="$slots.header">
            <div class="px-4 sm:px-6 lg:px-8 py-4">
              <slot name="header" />
            </div>
          </div>

          <!-- Main content -->
          <main class="px-4 sm:px-6 lg:px-8 py-6">
            <!-- Breadcrumbs -->
            <AdminBreadcrumbs
              v-if="breadcrumbs.length > 0"
              :items="breadcrumbs"
              class="mb-6"
            />
            <!-- Page content -->
            <slot />
          </main>
        </div>
      </div>

      <UModal />
    </UDashboardGroup>
  </div>
</template>
