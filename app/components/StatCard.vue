<!-- apps/web/components/StatCard.vue -->
<template>
  <UCard class="relative overflow-hidden">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div
          class="flex items-center justify-center w-12 h-12 rounded-lg"
          :class="iconClasses"
        >
          <UIcon :name="icon" class="h-6 w-6 text-white" />
        </div>
      </div>

      <div class="ml-4 flex-1">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              {{ title }}
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ formattedValue }}
            </p>
          </div>

          <UBadge
            v-if="badge"
            :label="badge.toString()"
            color="error"
            variant="solid"
            class="ml-2"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  value: number;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
  badge?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
});

const iconClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };
  return colorMap[props.color];
});

const formattedValue = computed(() => {
  if (props.value >= 1000000) {
    return (props.value / 1000000).toFixed(1) + 'M';
  } else if (props.value >= 1000) {
    return (props.value / 1000).toFixed(1) + 'K';
  }
  return props.value.toString();
});
</script>
