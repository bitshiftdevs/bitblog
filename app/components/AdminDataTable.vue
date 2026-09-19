<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/vue-table';

export interface ActionItem<T> {
  label: string;
  icon: string;
  onClick: (item: T) => void;
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
  variant?: string;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

interface EmptyState {
  icon: string;
  title: string;
  description: string;
  actions?: ButtonProps[];
}

export interface ServerPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Props<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  title: string;
  description?: string;
  actions?: ActionItem<T>[];
  emptyState: EmptyState;
  showSelection?: boolean;
  showFilter?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  pagination?: ServerPagination;
  rowClick?: (item: T) => void;
}

const props = withDefaults(defineProps<Props<any>>(), {
  loading: false,
  description: '',
  showSelection: true,
  showFilter: true,
  showPagination: true,
  pageSize: 10,
});

const emit = defineEmits<{
  'update:page': [page: number];
}>();

const onRowSelect = (event: Event, row: any) => {
  if (!props.rowClick) return;
  const target = event?.target as HTMLElement | undefined;
  // Ignore clicks that originated from interactive cells (checkbox, action dropdown, links, buttons)
  if (target?.closest('button, a, input, [role="menuitem"], [data-row-ignore-click]')) return;
  props.rowClick(row.original);
};

const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const UCheckbox = resolveComponent('UCheckbox');

const table = useTemplateRef('table');
const selectedRows = ref();
const globalFilter = ref();
const clientPagination = ref({
  pageIndex: 0,
  pageSize: props.pageSize,
});

const isServerPagination = computed(() => !!props.pagination);

const enhancedColumns = computed(() => {
  const cols = [...props.columns];

  if (props.showSelection) {
    cols.unshift({
      id: 'select',
      header: ({ table }: any) =>
        h(UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Select all',
        }),
      cell: ({ row }: any) =>
        h(
          'div',
          { 'data-row-ignore-click': '', onClick: (e: Event) => e.stopPropagation() },
          h(UCheckbox, {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
            'aria-label': 'Select row',
          }),
        ),
    });
  }

  if (props.actions && props.actions.length > 0) {
    cols.push({
      id: 'actions',
      cell: ({ row }: any) => {
        const items = props.actions!
          .filter((action) => !action.hidden || !action.hidden(row.original))
          .map((action) => ({
            label: action.label,
            icon: action.icon,
            color: action.color,
            disabled: action.disabled ? action.disabled(row.original) : false,
            onSelect: () => action.onClick(row.original),
          }));

        return h(
          'div',
          { class: 'text-right', 'data-row-ignore-click': '', onClick: (e: Event) => e.stopPropagation() },
          h(
            UDropdownMenu,
            {
              content: { align: 'end' },
              items,
              'aria-label': 'Actions dropdown',
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto',
                'aria-label': 'Actions dropdown',
              }),
          ),
        );
      },
    });
  }

  return cols;
});
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-sm sm:text-base">{{ description }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <slot />
      </div>
    </div>

    <UCard v-if="$slots.filters" class="mb-6 w-full">
      <slot name="filters" />
    </UCard>

    <UCard>
      <div v-if="showFilter" class="flex px-4 py-3.5 border-b border-accented">
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Filter..."
        />
      </div>

      <div class="overflow-x-auto w-full">
        <UTable
          ref="table"
          sticky
          :loading="loading"
          loading-animation="carousel"
          v-model:row-selection="selectedRows"
          v-model:global-filter="globalFilter"
          v-model:pagination="clientPagination"
          :pagination-options="
            showPagination && !isServerPagination
              ? { getPaginationRowModel: getPaginationRowModel() }
              : undefined
          "
          :columns="enhancedColumns"
          :data="data"
          :ui="rowClick ? { tr: 'cursor-pointer hover:bg-elevated/50 transition-colors' } : undefined"
          :on-select="rowClick ? onRowSelect : undefined"
          class="flex-1 max-h-[600px] w-full min-w-max"
        >
          <template #empty>
            <UEmpty
              :icon="emptyState.icon"
              :title="emptyState.title"
              :description="emptyState.description"
              :actions="emptyState.actions"
            />
          </template>
        </UTable>
      </div>

      <div
        v-if="showPagination && isServerPagination && pagination"
        class="flex justify-center border-t border-default pt-4"
      >
        <UPagination
          :page="pagination.page"
          :items-per-page="pagination.limit"
          :total="pagination.total"
          @update:page="(p) => emit('update:page', p)"
        />
      </div>

      <div
        v-else-if="showPagination && !isServerPagination"
        class="flex justify-center border-t border-default pt-4"
      >
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </UCard>
  </div>
</template>
