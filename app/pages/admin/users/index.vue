<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { ActionItem } from '~/components/AdminDataTable.vue';
import type { User } from '~~/shared/types';
import { confirmAction } from '~/composables/useConfirmModal';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const isInviteModalOpen = ref(false);

const users = ref<User[]>([
  {
    id: '1',
    name: 'John Admin',
    email: 'john@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Site administrator and lead developer',
    isAdmin: true,
    isActive: true,
    twoFactorEnabled: true,
    emailVerified: true,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Writer',
    email: 'jane@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b172e341?w=150',
    bio: 'Content writer and editor',
    isAdmin: false,
    isActive: true,
    twoFactorEnabled: false,
    emailVerified: true,
    lastSeenAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    name: 'Bob Contributor',
    email: 'bob@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Occasional contributor',
    isAdmin: false,
    isActive: false,
    twoFactorEnabled: false,
    emailVerified: true,
    lastSeenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]);

const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedRole = ref('all');

const statusOptions = [
  { label: 'All Users', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admins', value: 'admin' },
  { label: 'Users', value: 'user' },
];

const filteredUsers = computed(() => {
  let filtered = users.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((user) => (selectedStatus.value === 'active' ? user.isActive : !user.isActive));
  }

  if (selectedRole.value !== 'all') {
    filtered = filtered.filter((user) => (selectedRole.value === 'admin' ? user.isAdmin : !user.isAdmin));
  }

  return filtered;
});

const inviteForm = ref({ email: '', isAdmin: false, message: '' });
const resetInviteForm = () => {
  inviteForm.value = { email: '', isAdmin: false, message: '' };
};

const sendInvite = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.add({
      title: 'Success',
      description: `Invitation sent to ${inviteForm.value.email}`,
      color: 'success',
    });
    isInviteModalOpen.value = false;
    resetInviteForm();
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to send invitation', color: 'error' });
  }
};

const toggleUserStatus = async (user: User) => {
  user.isActive = !user.isActive;
  user.updatedAt = new Date().toISOString();
  toast.add({
    title: 'Success',
    description: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    color: 'success',
  });
};

const toggleAdminRole = async (user: User) => {
  user.isAdmin = !user.isAdmin;
  user.updatedAt = new Date().toISOString();
  toast.add({
    title: 'Success',
    description: `Admin role ${user.isAdmin ? 'granted' : 'removed'} successfully`,
    color: 'success',
  });
};

const deleteUser = (user: User) => {
  confirmAction({
    title: 'Delete User',
    question: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
    confirmLabel: 'Delete',
    confirmColor: 'error',
    onConfirm: async () => {
      const index = users.value.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users.value.splice(index, 1);
        toast.add({ title: 'Success', description: 'User deleted successfully', color: 'success' });
      }
    },
  });
};

const formatLastSeen = (lastSeenAt: string) => {
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffInHours < 1) return 'Online';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDate(lastSeenAt);
};

const UAvatar = resolveComponent('UAvatar');
const UBadge = resolveComponent('UBadge');
const UIcon = resolveComponent('UIcon');

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, { src: row.original.avatarUrl, alt: row.original.name, size: 'sm' }),
        h('div', undefined, [
          h('div', { class: 'text-sm font-medium text-highlighted' }, row.original.name),
          h('div', { class: 'text-sm text-muted' }, row.original.email),
        ]),
      ]),
  },
  {
    accessorKey: 'isAdmin',
    header: 'Role',
    cell: ({ row }) =>
      h(UBadge, {
        label: row.original.isAdmin ? 'Admin' : 'User',
        color: row.original.isAdmin ? 'primary' : 'neutral',
        variant: 'subtle',
        size: 'sm',
      }),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(UBadge, {
          label: row.original.isActive ? 'Active' : 'Inactive',
          color: row.original.isActive ? 'success' : 'error',
          variant: 'subtle',
          size: 'sm',
        }),
        row.original.twoFactorEnabled
          ? h(UIcon, { name: 'i-lucide-shield-check', class: 'w-4 h-4 text-success', title: '2FA Enabled' })
          : null,
        row.original.emailVerified
          ? h(UIcon, { name: 'i-lucide-mail-check', class: 'w-4 h-4 text-info', title: 'Email Verified' })
          : null,
      ]),
  },
  {
    accessorKey: 'lastSeenAt',
    header: 'Last Seen',
    cell: ({ row }) =>
      h('span', { class: 'text-sm text-muted' }, formatLastSeen(row.original.lastSeenAt || row.original.updatedAt)),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.createdAt)),
  },
];

const actions: ActionItem<User>[] = [
  {
    label: 'Toggle Status',
    icon: 'i-lucide-user-check',
    onClick: (user) => toggleUserStatus(user),
  },
  {
    label: 'Toggle Admin',
    icon: 'i-lucide-shield-plus',
    onClick: (user) => toggleAdminRole(user),
  },
  {
    label: 'View Profile',
    icon: 'i-lucide-user',
    onClick: (user) => navigateTo(`/profile/${user.id}`),
  },
  {
    label: 'Delete User',
    icon: 'i-lucide-trash',
    color: 'error',
    onClick: (user) => deleteUser(user),
  },
];

const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Users' }]);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <AdminDataTable
      :data="filteredUsers"
      :columns="columns"
      :actions="actions"
      title="Users"
      description="Manage user accounts and permissions"
      :row-click="(user: User) => navigateTo(`/profile/${user.id}`)"
      :show-selection="false"
      :show-filter="false"
      :show-pagination="false"
      :empty-state="{
        icon: 'i-lucide-users',
        title: searchQuery ? 'No users found' : 'No users yet',
        description: searchQuery ? 'Try adjusting your search.' : 'Get started by inviting your first user.',
      }"
    >
      <UButton @click="isInviteModalOpen = true" icon="i-lucide-user-plus" size="lg" label="Invite User" />

      <template #filters>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UInput v-model="searchQuery" placeholder="Search users..." icon="i-lucide-search" />
          <USelectMenu v-model="selectedStatus" :items="statusOptions" value-key="value" placeholder="Filter by status" />
          <USelectMenu v-model="selectedRole" :items="roleOptions" value-key="value" placeholder="Filter by role" />
        </div>
      </template>
    </AdminDataTable>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="text-2xl font-bold text-highlighted">{{ users.length }}</div>
        <div class="text-sm text-muted">Total Users</div>
      </UCard>
      <UCard>
        <div class="text-2xl font-bold text-success">{{ users.filter((u) => u.isActive).length }}</div>
        <div class="text-sm text-muted">Active Users</div>
      </UCard>
      <UCard>
        <div class="text-2xl font-bold text-primary">{{ users.filter((u) => u.isAdmin).length }}</div>
        <div class="text-sm text-muted">Admins</div>
      </UCard>
      <UCard>
        <div class="text-2xl font-bold text-info">{{ users.filter((u) => u.emailVerified).length }}</div>
        <div class="text-sm text-muted">Verified</div>
      </UCard>
    </div>

    <UModal v-model:open="isInviteModalOpen" title="Invite User">
      <template #body>
        <UForm :state="inviteForm" @submit.prevent="sendInvite" class="space-y-4">
          <UFormField label="Email Address" required>
            <UInput v-model="inviteForm.email" type="email" placeholder="user@example.com" required class="w-full" />
          </UFormField>

          <UFormField label="Role" help="Admins can manage content, users, and site settings.">
            <UCheckbox v-model="inviteForm.isAdmin" label="Grant admin privileges" />
          </UFormField>

          <UFormField label="Personal Message">
            <UTextarea v-model="inviteForm.message" placeholder="Optional welcome message..." :rows="3" class="w-full" />
          </UFormField>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton type="button" @click="isInviteModalOpen = false" color="neutral" variant="outline" label="Cancel" />
            <UButton type="submit" label="Send Invitation" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
