<!-- apps/web/components/ThemeToggle.vue -->
<template>
  <UButton
    :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
    variant="ghost"
    size="sm"
    @click="toggleTheme"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
  />
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => {
  return colorMode.value === 'dark'
})

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
