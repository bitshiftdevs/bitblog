<!-- apps/web/components/PostCardSkeleton.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <!-- Image skeleton -->
    <div class="aspect-video bg-gray-300 dark:bg-gray-600"></div>
    
    <!-- Content skeleton -->
    <div class="p-6 space-y-4">
      <!-- Category badge -->
      <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      
      <!-- Title -->
      <div class="space-y-2">
        <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
      
      <!-- Excerpt -->
      <div class="space-y-2">
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
      
      <!-- Tags -->
      <div class="flex space-x-2">
        <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      
      <!-- Meta info -->
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div class="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
  </div>
</template>

