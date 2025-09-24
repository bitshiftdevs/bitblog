<script setup lang="ts">
import type { Category } from '~~/shared/types';

const { title, category } = defineProps<{
  title: string;
  category?: Category;
  categories: Category[];
}>();

// Form data
const formData = ref({
  name: category?.name,
  description: category?.description,
  parentId: category?.parentId,
});
const emit = defineEmits<{
  submit: [typeof formData.value];
}>();
</script>

<template>
  <UModal :title>
    <template #body>
      <form @submit.prevent="emit('submit', formData)" class="space-y-4">
        <UFormField label="Name" required>
          <UInput
            v-model="formData.name"
            placeholder="Category name"
            required
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="formData.description"
            placeholder="Brief description (optional)"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Parent Category">
          <USelectMenu
            v-model="formData.parentId"
            :options="categories.map((c) => ({ label: c.name, value: c.id }))"
            placeholder="Select parent category (optional)"
            nullable
          />
        </UFormField>

        <div class="flex justify-end space-x-3 pt-4">
          <UButton type="button" color="accent" variant="outline">
            Cancel
          </UButton>
          <UButton type="submit"> Create Category </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
