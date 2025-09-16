
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
