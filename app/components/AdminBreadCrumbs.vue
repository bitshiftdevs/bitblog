<!-- apps/web/components/AdminBreadcrumbs.vue -->
<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <li>
        <div>
          <NuxtLink 
            to="/admin" 
            class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <UIcon name="i-heroicons-home" class="h-4 w-4" />
            <span class="sr-only">Home</span>
          </NuxtLink>
        </div>
      </li>
      
      <li v-for="(item, index) in items" :key="index">
        <div class="flex items-center">
          <UIcon 
            name="i-heroicons-chevron-right" 
            class="h-4 w-4 text-gray-300 dark:text-gray-600 mx-2" 
          />
          
          <NuxtLink
            v-if="item.to && index < items.length - 1"
            :to="item.to"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {{ item.label }}
          </NuxtLink>
          
          <span
            v-else
            class="text-sm font-medium text-gray-900 dark:text-white"
            :aria-current="index === items.length - 1 ? 'page' : undefined"
          >
            {{ item.label }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>
