<!-- apps/web/components/AdminNotifications.vue -->
<template>
  <UDropdownMenu
    :items="notificationItems"
    :popper="{ placement: 'bottom-end' }"
  >
    <UButton
      variant="ghost"
      size="sm"
      icon="i-lucide-bell"
      :class="hasUnread ? 'text-primary-600' : 'text-gray-500'"
      class="relative"
    >
      <!-- Unread indicator -->
      <span
        v-if="hasUnread"
        class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"
      />
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
// Mock notifications - in real app, fetch from API
const notifications = ref([
  {
    id: '1',
    type: 'comment',
    title: 'New comment on your post',
    message: 'John Doe commented on "Getting Started with TypeScript"',
    time: '2 minutes ago',
    read: false,
    action: () => navigateTo('/admin/comments'),
  },
  {
    id: '2',
    type: 'post',
    title: 'Post published successfully',
    message: 'Your post "Modern CSS Layout" is now live',
    time: '1 hour ago',
    read: false,
    action: () => navigateTo('/admin/posts'),
  },
  {
    id: '3',
    type: 'user',
    title: 'New user registered',
    message: 'Jane Smith just joined the platform',
    time: '3 hours ago',
    read: true,
    action: () => navigateTo('/admin/users'),
  },
]);

const hasUnread = computed(() => notifications.value.some((n) => !n.read));

const notificationItems = computed(() => {
  const items = [];

  // Header
  items.push([
    {
      label: 'Notifications',
      slot: 'header',
      disabled: true,
    },
  ]);

  // Notifications
  if (notifications.value.length > 0) {
    const notificationItems = notifications.value
      .slice(0, 5)
      .map((notification) => ({
        label: notification.title,
        description: notification.message,
        icon: getNotificationIcon(notification.type),
        click: notification.action,
        class: notification.read ? 'opacity-75' : '',
      }));

    items.push(notificationItems);

    // View all link
    items.push([
      {
        label: 'View all notifications',
        icon: 'i-lucide-arrow-right',
        to: '/admin/notifications',
      },
    ]);
  } else {
    items.push([
      {
        label: 'No new notifications',
        disabled: true,
        icon: 'i-lucide-bell-slash',
      },
    ]);
  }

  return items;
});

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return 'i-lucide-chat-bubble-left';
    case 'post':
      return 'i-lucide-file-text';
    case 'user':
      return 'i-lucide-user';
    default:
      return 'i-lucide-bell';
  }
};
</script>
