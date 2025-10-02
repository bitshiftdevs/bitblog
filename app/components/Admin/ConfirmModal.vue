<script setup lang="ts">
const { title, question } = defineProps<{
  title: string;
  question: string;
}>();

const emit = defineEmits<{
  confirm: [];
  close: [boolean];
}>();
</script>

<template>
  <UModal :title>
    <template #body>
      <UContainer>
        {{ question }}
      </UContainer>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="emit('close', true)" label="Cancel" />
        <UButton @click="emit('confirm')" label="Confirm" />
      </div>
    </template>
  </UModal>
</template>
