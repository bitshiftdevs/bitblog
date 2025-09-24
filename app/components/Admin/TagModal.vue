<script setup lang="ts">
import type { Tag } from '~~/shared/types';

const { title, tag } = defineProps<{
  title: string;
  tag?: Tag;
  tags: Tags[];
}>();

// Form data
const formData = ref({
  name: tag?.name,
  description: tag?.description,
  color: tag?.color ?? '#3B82F6',
});
const emit = defineEmits<{
  submit: [typeof formData.value];
}>();
</script>

<template>
  <UModal :title>
    <template #body>
      <form @submit.prevent="emit('submit', formData.value)" class="space-y-4">
        <UFormField label="Name" requierror>
          <UInput v-model="formData.name" placeholder="Tag name" requierror />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="formData.description"
            placeholder="Brief description (optional)"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Color">
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <input
                v-model="formData.color"
                type="color"
                class="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <UInput
                v-model="formData.color"
                placeholder="#3B82F6"
                class="flex-1"
              />
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in tagColors"
                :key="color"
                type="button"
                @click="formData.color = color"
                class="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                :class="
                  formData.color === color
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-600'
                "
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
        </UFormField>

        <div class="flex justify-end space-x-3 pt-4">
          <UButton
            type="button"
            @click="isCreateModalOpen = false"
            color="gray"
            variant="outline"
          >
            Cancel
          </UButton>
          <UButton type="submit"> Create Tag </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
