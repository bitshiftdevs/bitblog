<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const typeConfig = {
  note: { color: 'info', icon: 'i-lucide-info' },
  tip: { color: 'success', icon: 'i-lucide-lightbulb' },
  warning: { color: 'warning', icon: 'i-lucide-triangle-alert' },
  caution: { color: 'error', icon: 'i-lucide-octagon-alert' },
} as const;

type CalloutType = keyof typeof typeConfig;

const currentType = computed(() => props.node.attrs.type as CalloutType);
const config = computed(() => typeConfig[currentType.value] ?? typeConfig.note);

const typeItems = Object.keys(typeConfig).map((type) => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  onSelect: () => props.updateAttributes({ type }),
}));
</script>

<template>
  <NodeViewWrapper class="my-4">
    <div
      :class="[
        'relative flex gap-3 rounded-md border px-4 py-3 text-sm',
        `border-${config.color}/25 bg-${config.color}/10 text-${config.color}-600 dark:text-${config.color}-300`,
      ]"
    >
      <!-- Type picker (only when editor is editable) -->
      <UDropdownMenu
        v-if="editor.isEditable"
        :items="[typeItems]"
        :content="{ side: 'bottom' }"
      >
        <UButton
          :icon="config.icon"
          :color="config.color"
          variant="ghost"
          size="xs"
          class="shrink-0 mt-0.5"
        />
      </UDropdownMenu>
      <UIcon v-else :name="config.icon" class="size-4 shrink-0 mt-0.5" />

      <!-- Editable content -->
      <NodeViewContent class="flex-1 min-w-0" />
    </div>
  </NodeViewWrapper>
</template>
