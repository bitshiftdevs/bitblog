<script setup lang="ts">
type Color = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';

const props = withDefaults(
  defineProps<{
    title: string;
    question: string;
    confirmLabel?: string;
    confirmColor?: Color;
    cancelLabel?: string;
    onConfirm?: () => void | Promise<void>;
  }>(),
  {
    confirmLabel: 'Confirm',
    confirmColor: 'primary',
    cancelLabel: 'Cancel',
  },
);

const emit = defineEmits<{ close: [boolean] }>();
const loading = ref(false);

const handleConfirm = async () => {
  try {
    loading.value = true;
    await props.onConfirm?.();
    emit('close', true);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UModal :title="title">
    <template #body>
      <p class="text-sm text-default">{{ question }}</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton variant="ghost" :label="cancelLabel" :disabled="loading" @click="emit('close', false)" />
        <UButton :label="confirmLabel" :color="confirmColor" :loading="loading" @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>
