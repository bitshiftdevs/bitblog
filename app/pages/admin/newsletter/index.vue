<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();

// Mock newsletter data
const newsletter = ref({
  stats: {
    totalSubscribers: 1234,
    activeSubscribers: 1189,
    unsubscribed: 45,
    openRate: 24.5,
    clickRate: 3.2
  },
  recentCampaigns: [
    {
      id: '1',
      subject: 'Weekly Tech Roundup - Issue #47',
      status: 'sent',
      sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      recipients: 1189,
      opens: 291,
      clicks: 38,
      openRate: 24.5,
      clickRate: 3.2
    },
    {
      id: '2',
      subject: 'New Post: Advanced TypeScript Patterns',
      status: 'sent',
      sentAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      recipients: 1156,
      opens: 334,
      clicks: 52,
      openRate: 28.9,
      clickRate: 4.5
    },
    {
      id: '3',
      subject: 'Welcome to Our Community!',
      status: 'draft',
      createdAt: new Date().toISOString(),
      recipients: 0,
      opens: 0,
      clicks: 0
    }
  ],
  subscribers: [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      status: 'active',
      subscribedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      source: 'blog_signup'
    },
    {
      id: '2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      status: 'active',
      subscribedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      source: 'footer_form'
    },
    {
      id: '3',
      email: 'bob@example.com',
      name: 'Bob Johnson',
      status: 'unsubscribed',
      subscribedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      unsubscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      source: 'popup'
    }
  ]
});

const activeTab = ref('overview');
const isCreateCampaignOpen = ref(false);
const selectedSubscribers = ref([]);

// Campaign form
const campaignForm = ref({
  subject: '',
  content: '',
  template: 'basic',
  audience: 'all',
  scheduledAt: ''
});

const resetCampaignForm = () => {
  campaignForm.value = {
    subject: '',
    content: '',
    template: 'basic',
    audience: 'all',
    scheduledAt: ''
  };
};

// Create campaign
const createCampaign = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCampaign = {
      id: Date.now().toString(),
      subject: campaignForm.value.subject,
      status: campaignForm.value.scheduledAt ? 'scheduled' : 'sent',
      sentAt: campaignForm.value.scheduledAt || new Date().toISOString(),
      recipients: newsletter.value.stats.activeSubscribers,
      opens: 0,
      clicks: 0,
      openRate: 0,
      clickRate: 0
    };

    newsletter.value.recentCampaigns.unshift(newCampaign);

    toast.add({
      title: 'Success',
      description: `Campaign ${campaignForm.value.scheduledAt ? 'scheduled' : 'sent'} successfully`,
      color: 'success'
    });

    isCreateCampaignOpen.value = false;
    resetCampaignForm();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to create campaign',
      color: 'error'
    });
  }
};

// Export subscribers
const exportSubscribers = () => {
  toast.add({
    title: 'Export Started',
    description: 'Subscriber list export will be emailed to you shortly',
    color: 'blue'
  });
};

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return 'success';
    case 'scheduled': return 'blue';
    case 'draft': return 'yellow';
    case 'failed': return 'error';
    default: return 'gray';
  }
};

const getSubscriberStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'unsubscribed': return 'error';
    case 'bounced': return 'orange';
    default: return 'gray';
  }
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Newsletter' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Newsletter
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your email campaigns and subscribers
        </p>
      </div>
      <UButton
        @click="isCreateCampaignOpen = true"
        icon="i-lucide-mail"
        size="sm"
      >
        Create Campaign
      </UButton>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'overview'"
          :class="activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
        >
          Overview
        </button>
        <button
          @click="activeTab = 'campaigns'"
          :class="activeTab === 'campaigns' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
        >
          Campaigns
        </button>
        <button
          @click="activeTab = 'subscribers'"
          :class="activeTab === 'subscribers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
        >
          Subscribers
        </button>
      </nav>
    </div>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="space-y-6">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-users" class="w-8 h-8 text-blue-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subscribers</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ newsletter.stats.totalSubscribers.toLocaleString() }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-user-check" class="w-8 h-8 text-green-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ newsletter.stats.activeSubscribers.toLocaleString() }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-user-x" class="w-8 h-8 text-red-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Unsubscribed</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ newsletter.stats.unsubscribed.toLocaleString() }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-mail-open" class="w-8 h-8 text-purple-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Open Rate</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ newsletter.stats.openRate }}%
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-mouse-pointer-click" class="w-8 h-8 text-orange-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Click Rate</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ newsletter.stats.clickRate }}%
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Campaigns -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Recent Campaigns</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="campaign in newsletter.recentCampaigns.slice(0, 3)"
            :key="campaign.id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ campaign.subject }}
              </h4>
              <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ formatDate(campaign.sentAt || campaign.createdAt) }}</span>
                <span>{{ campaign.recipients }} recipients</span>
                <UBadge
                  :label="campaign.status"
                  :color="getStatusColor(campaign.status)"
                  size="xs"
                />
              </div>
            </div>
            <div v-if="campaign.status === 'sent'" class="text-right">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ campaign.openRate }}% opens
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ campaign.clickRate }}% clicks
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Campaigns Tab -->
    <div v-if="activeTab === 'campaigns'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          All Campaigns
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="campaign in newsletter.recentCampaigns"
          :key="campaign.id"
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ campaign.subject }}
                </h3>
                <UBadge
                  :label="campaign.status"
                  :color="getStatusColor(campaign.status)"
                  size="xs"
                />
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Recipients:</span>
                  <span class="font-medium text-gray-900 dark:text-white ml-1">
                    {{ campaign.recipients }}
                  </span>
                </div>
                <div v-if="campaign.opens">
                  <span class="text-gray-500 dark:text-gray-400">Opens:</span>
                  <span class="font-medium text-gray-900 dark:text-white ml-1">
                    {{ campaign.opens }} ({{ campaign.openRate }}%)
                  </span>
                </div>
                <div v-if="campaign.clicks">
                  <span class="text-gray-500 dark:text-gray-400">Clicks:</span>
                  <span class="font-medium text-gray-900 dark:text-white ml-1">
                    {{ campaign.clicks }} ({{ campaign.clickRate }}%)
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">
                    {{ campaign.status === 'sent' ? 'Sent:' : 'Created:' }}
                  </span>
                  <span class="font-medium text-gray-900 dark:text-white ml-1">
                    {{ formatDate(campaign.sentAt || campaign.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <UDropdownMenu
              :items="[
                [
                  {
                    label: 'View Details',
                    icon: 'i-lucide-eye',
                    click: () => {}
                  },
                  {
                    label: 'Duplicate',
                    icon: 'i-lucide-copy',
                    click: () => {}
                  }
                ],
                [
                  {
                    label: 'Delete',
                    icon: 'i-lucide-trash',
                    click: () => {}
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
          </div>
        </div>
      </div>
    </div>

    <!-- Subscribers Tab -->
    <div v-if="activeTab === 'subscribers'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          Subscribers
        </h2>
        <UButton
          @click="exportSubscribers"
          icon="i-lucide-download"
          size="sm"
          color="gray"
          variant="outline"
        >
          Export CSV
        </UButton>
      </div>

      <UCard>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscriber
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscribed
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="subscriber in newsletter.subscribers"
                :key="subscriber.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ subscriber.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ subscriber.email }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    :label="subscriber.status"
                    :color="getSubscriberStatusColor(subscriber.status)"
                    size="xs"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {{ subscriber.source.replace('_', ' ') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(subscriber.subscribedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <UButton
                    icon="i-lucide-more-vertical"
                    size="xs"
                    color="gray"
                    variant="ghost"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Create Campaign Modal -->
    <UModal v-model="isCreateCampaignOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Create Campaign</h3>
        </template>

        <form @submit.prevent="createCampaign" class="space-y-4">
          <UFormField label="Subject Line" required>
            <UInput
              v-model="campaignForm.subject"
              placeholder="Your campaign subject"
              required
            />
          </UFormField>

          <UFormField label="Template">
            <USelectMenu
              v-model="campaignForm.template"
              :options="[
                { label: 'Basic Template', value: 'basic' },
                { label: 'Newsletter Template', value: 'newsletter' },
                { label: 'Announcement Template', value: 'announcement' }
              ]"
            />
          </UFormField>

          <UFormField label="Audience">
            <USelectMenu
              v-model="campaignForm.audience"
              :options="[
                { label: 'All Subscribers', value: 'all' },
                { label: 'Active Subscribers Only', value: 'active' },
                { label: 'New Subscribers', value: 'new' }
              ]"
            />
          </UFormField>

          <UFormField label="Content" required>
            <UTextarea
              v-model="campaignForm.content"
              placeholder="Your campaign content..."
              :rows="6"
              required
            />
          </UFormField>

          <UFormField label="Schedule (Optional)">
            <UInput
              v-model="campaignForm.scheduledAt"
              type="datetime-local"
            />
            <template #description>
              Leave empty to send immediately
            </template>
          </UFormField>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton
              type="button"
              @click="isCreateCampaignOpen = false"
              color="gray"
              variant="outline"
            >
              Cancel
            </UButton>
            <UButton type="submit">
              {{ campaignForm.scheduledAt ? 'Schedule Campaign' : 'Send Campaign' }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>