<script setup lang="ts">
import type { TiptapCommandType } from '~~/shared/types';

const { items, command } = defineProps<{
  items: Array<any>;
  command: Function;
}>();
const selectedIndex = ref(0);

const selectItem = (props?: TiptapCommandType) => {
  const item = items[selectedIndex.value];

  if (!props) {
    command({ id: item });
    return true;
  }
  item.command({ editor: props.editor, range: props.range });
  return true;
};

function onKeyDown(event: KeyboardEvent, props: TiptapCommandType) {
  if (event.key === 'ArrowUp' || (event.shiftKey && event.key === 'Tab')) {
    upHandler();
    return true;
  }

  if (event.key === 'ArrowDown' || event.key === 'Tab') {
    downHandler();
    return true;
  }

  if (event.key === 'Enter') {
    return selectItem(props);
  }

  return false;
}

function upHandler() {
  selectedIndex.value = (selectedIndex.value + items.length - 1) % items.length;
}

function downHandler() {
  selectedIndex.value = (selectedIndex.value + 1) % items.length;
}

defineExpose({
  onKeyDown,
});
</script>

<template>
  <UContainer class="flex flex-col">
    <UButton
      :variant="index === selectedIndex ? 'soft' : 'solid'"
      v-for="(item, index) in items"
      :key="index"
      :label="item.label"
    />
  </UContainer>
</template>
