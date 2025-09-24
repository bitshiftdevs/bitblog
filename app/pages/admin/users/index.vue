<script setup lang="ts">
import type { User } from '~~/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const isInviteModalOpen = ref(false);

// Mock users data
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date(Date.now() - 3600000).toISOString()
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
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]);

// Filters
const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedRole = ref('all');

const statusOptions = [
  { label: 'All Users', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admins', value: 'admin' },
  { label: 'Users', value: 'user' }
];

// Filtered users
const filteredUsers = computed(() => {
  let filtered = users.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(user =>
      selectedStatus.value === 'active' ? user.isActive : !user.isActive
    );
  }

  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(user =>
      selectedRole.value === 'admin' ? user.isAdmin : !user.isAdmin
    );
  }

  return filtered;
});

// Invite form
const inviteForm = ref({
  email: '',
  isAdmin: false,
  message: ''
});

const resetInviteForm = () => {
  inviteForm.value = {
    email: '',
    isAdmin: false,
    message: ''
  };
};

const sendInvite = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.add({
      title: 'Success',
      description: `Invitation sent to ${inviteForm.value.email}`,
      color: 'success'
    });

    isInviteModalOpen.value = false;
    resetInviteForm();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to send invitation',
      color: 'error'
    });
  }
};

// User actions
const toggleUserStatus = async (user: User) => {
  user.isActive = !user.isActive;
  user.updatedAt = new Date().toISOString();

  toast.add({
    title: 'Success',
    description: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    color: 'success'
  });
};

const toggleAdminRole = async (user: User) => {
  user.isAdmin = !user.isAdmin;
  user.updatedAt = new Date().toISOString();

  toast.add({
    title: 'Success',
    description: `Admin role ${user.isAdmin ? 'granted' : 'removed'} successfully`,
    color: 'success'
  });
};

const deleteUser = async (user: User) => {
  const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);
  if (!confirmed) return;

  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users.value.splice(index, 1);
    toast.add({
      title: 'Success',
      description: 'User deleted successfully',
      color: 'success'
    });
  }
};

// Helper functions
const getStatusColor = (user: User) => {
  return user.isActive ? 'success' : 'error';
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

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Users
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage user accounts and permissions
        </p>
      </div>
      <UButton
        @click="isInviteModalOpen = true"
        icon="i-lucide-user-plus"
        size="sm"
      >
        Invite User
      </UButton>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search users..."
        icon="i-lucide-search"
      />
      <USelectMenu
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Filter by status"
      />
      <USelectMenu
        v-model="selectedRole"
        :options="roleOptions"
        placeholder="Filter by role"
      />
    </div>

    <!-- Users Table -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Seen
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UAvatar :src="user.avatarUrl" :alt="user.name" size="sm" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :label="user.isAdmin ? 'Admin' : 'User'"
                  :color="user.isAdmin ? 'blue' : 'gray'"
                  size="xs"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <UBadge
                    :label="user.isActive ? 'Active' : 'Inactive'"
                    :color="getStatusColor(user)"
                    size="xs"
                  />
                  <UIcon
                    v-if="user.twoFactorEnabled"
                    name="i-lucide-shield-check"
                    class="w-4 h-4 text-green-500"
                    title="2FA Enabled"
                  />
                  <UIcon
                    v-if="user.emailVerified"
                    name="i-lucide-mail-check"
                    class="w-4 h-4 text-blue-500"
                    title="Email Verified"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatLastSeen(user.lastSeenAt || user.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu
                  :items="[
                    [
                      {
                        label: user.isActive ? 'Deactivate' : 'Activate',
                        icon: user.isActive ? 'i-lucide-user-x' : 'i-lucide-user-check',
                        click: () => toggleUserStatus(user)
                      },
                      {
                        label: user.isAdmin ? 'Remove Admin' : 'Make Admin',
                        icon: user.isAdmin ? 'i-lucide-shield-x' : 'i-lucide-shield-plus',
                        click: () => toggleAdminRole(user)
                      }
                    ],
                    [
                      {
                        label: 'View Profile',
                        icon: 'i-lucide-user',
                        to: `/profile/${user.id}`
                      },
                      {
                        label: 'Send Message',
                        icon: 'i-lucide-mail',
                        click: () => {}
                      }
                    ],
                    [
                      {
                        label: 'Delete User',
                        icon: 'i-lucide-trash',
                        click: () => deleteUser(user)
                      }
                    ]
                  ]"
                >
                  <UButton
                    icon="i-lucide-more-vertical"
                    size="xs"
                    color="gray"
                    variant="ghost"
                  />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Empty State -->
    <div v-if="!filteredUsers.length" class="text-center py-12">
      <UIcon name="i-lucide-users" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ searchQuery ? 'No users found' : 'No users yet' }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery ? 'Try adjusting your search.' : 'Get started by inviting your first user.' }}
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ users.length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Total Users
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ users.filter(u => u.isActive).length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Active Users
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ users.filter(u => u.isAdmin).length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Admins
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ users.filter(u => u.emailVerified).length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Verified
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <UModal v-model="isInviteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Invite User</h3>
        </template>

        <form @submit.prevent="sendInvite" class="space-y-4">
          <UFormField label="Email Address" required>
            <UInput
              v-model="inviteForm.email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </UFormField>

          <UFormField label="Role">
            <UCheckbox
              v-model="inviteForm.isAdmin"
              label="Grant admin privileges"
            />
            <template #description>
              Admins can manage content, users, and site settings.
            </template>
          </UFormField>

          <UFormField label="Personal Message">
            <UTextarea
              v-model="inviteForm.message"
              placeholder="Optional welcome message..."
              :rows="3"
            />
          </UFormField>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton
              type="button"
              @click="isInviteModalOpen = false"
              color="gray"
              variant="outline"
            >
              Cancel
            </UButton>
            <UButton type="submit">
              Send Invitation
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>