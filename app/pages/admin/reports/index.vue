<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

// Mock reports data
const reports = ref([
  {
    id: '1',
    name: 'Monthly Performance Report',
    description: 'Comprehensive overview of site performance for the past month',
    type: 'performance',
    schedule: 'monthly',
    lastGenerated: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'ready',
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Content Engagement Analysis',
    description: 'Detailed analysis of post engagement and reader behavior',
    type: 'content',
    schedule: 'weekly',
    lastGenerated: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'ready',
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'User Activity Summary',
    description: 'Summary of user registrations, logins, and activity patterns',
    type: 'users',
    schedule: 'daily',
    lastGenerated: new Date().toISOString(),
    status: 'generating',
    fileSize: '-'
  },
  {
    id: '4',
    name: 'SEO Performance Report',
    description: 'Search engine optimization metrics and recommendations',
    type: 'seo',
    schedule: 'monthly',
    lastGenerated: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: 'ready',
    fileSize: '3.1 MB'
  }
]);

const quickReports = ref([
  {
    title: 'Top Performing Posts',
    description: 'Posts with highest engagement in the last 30 days',
    icon: 'i-lucide-trending-up',
    color: 'success',
    data: [
      { title: 'Advanced TypeScript Patterns', views: 5432, engagement: '8.2%' },
      { title: 'React Performance Optimization', views: 4321, engagement: '7.8%' },
      { title: 'CSS Grid Masterclass', views: 3876, engagement: '9.1%' }
    ]
  },
  {
    title: 'Traffic Sources',
    description: 'Where your visitors are coming from',
    icon: 'i-lucide-globe',
    color: 'blue',
    data: [
      { source: 'Organic Search', percentage: 45.2, change: '+12%' },
      { source: 'Direct Traffic', percentage: 28.7, change: '-3%' },
      { source: 'Social Media', percentage: 16.8, change: '+8%' },
      { source: 'Referrals', percentage: 9.3, change: '+5%' }
    ]
  },
  {
    title: 'Content Performance',
    description: 'How your content is performing overall',
    icon: 'i-lucide-file-text',
    color: 'purple',
    data: [
      { metric: 'Average Time on Page', value: '3m 42s', change: '+15%' },
      { metric: 'Pages per Session', value: '2.8', change: '+7%' },
      { metric: 'Bounce Rate', value: '38.2%', change: '-5%' }
    ]
  }
]);

const isGenerateModalOpen = ref(false);
const generateForm = ref({
  type: 'custom',
  dateRange: '30d',
  includeCharts: true,
  includeRawData: false,
  format: 'pdf'
});

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ready': return 'success';
    case 'generating': return 'yellow';
    case 'error': return 'error';
    default: return 'gray';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'performance': return 'i-lucide-zap';
    case 'content': return 'i-lucide-file-text';
    case 'users': return 'i-lucide-users';
    case 'seo': return 'i-lucide-search';
    default: return 'i-lucide-file';
  }
};

const generateReport = async () => {
  // Mock report generation
  const newReport = {
    id: Date.now().toString(),
    name: 'Custom Report',
    description: 'Custom generated report',
    type: 'custom',
    schedule: 'manual',
    lastGenerated: new Date().toISOString(),
    status: 'generating',
    fileSize: '-'
  };

  reports.value.unshift(newReport);
  isGenerateModalOpen.value = false;

  // Simulate report generation completion
  setTimeout(() => {
    newReport.status = 'ready';
    newReport.fileSize = '1.2 MB';
  }, 3000);
};

const downloadReport = (reportId: string) => {
  // Mock download
  console.log('Downloading report:', reportId);
};

const deleteReport = (reportId: string) => {
  const index = reports.value.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports.value.splice(index, 1);
  }
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Reports' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Generate and download detailed reports about your site
        </p>
      </div>
      <UButton
        @click="isGenerateModalOpen = true"
        icon="i-lucide-plus"
        size="sm"
      >
        Generate Report
      </UButton>
    </div>

    <!-- Quick Insights -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard
        v-for="insight in quickReports"
        :key="insight.title"
      >
        <template #header>
          <div class="flex items-center space-x-3">
            <UIcon
              :name="insight.icon"
              :class="`w-5 h-5 text-${insight.color}-500`"
            />
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ insight.title }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ insight.description }}
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="(item, index) in insight.data.slice(0, 3)"
            :key="index"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-600 dark:text-gray-400 truncate mr-2">
              {{ item.title || item.source || item.metric }}
            </span>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ item.views || item.percentage || item.value }}
              </span>
              <span
                v-if="item.engagement || item.change"
                :class="(item.change || item.engagement)?.includes('+') ? 'text-green-600' : 'text-red-600'"
                class="text-xs"
              >
                {{ item.engagement || item.change }}
              </span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Reports List -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium">Generated Reports</h3>
      </template>

      <div class="space-y-4">
        <div
          v-for="report in reports"
          :key="report.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-4">
            <UIcon
              :name="getTypeIcon(report.type)"
              class="w-8 h-8 text-gray-400"
            />
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ report.name }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ report.description }}
              </p>
              <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ formatDate(report.lastGenerated) }}</span>
                <span>{{ report.fileSize }}</span>
                <span class="capitalize">{{ report.schedule }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <UBadge
              :label="report.status"
              :color="getStatusColor(report.status)"
              size="xs"
            />

            <div class="flex items-center space-x-2">
              <UButton
                v-if="report.status === 'ready'"
                @click="downloadReport(report.id)"
                icon="i-lucide-download"
                size="xs"
                color="gray"
                variant="outline"
              />
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'Download',
                      icon: 'i-lucide-download',
                      click: () => downloadReport(report.id),
                      disabled: report.status !== 'ready'
                    },
                    {
                      label: 'Regenerate',
                      icon: 'i-lucide-refresh-cw',
                      click: () => {}
                    }
                  ],
                  [
                    {
                      label: 'Delete',
                      icon: 'i-lucide-trash',
                      click: () => deleteReport(report.id)
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

      <div v-if="!reports.length" class="text-center py-12">
        <UIcon name="i-lucide-file-chart-line" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports yet</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate your first report to get insights about your site.
        </p>
      </div>
    </UCard>

    <!-- Generate Report Modal -->
    <UModal v-model="isGenerateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Generate New Report</h3>
        </template>

        <form @submit.prevent="generateReport" class="space-y-4">
          <UFormField label="Report Type" required>
            <USelectMenu
              v-model="generateForm.type"
              :options="[
                { label: 'Custom Report', value: 'custom' },
                { label: 'Performance Report', value: 'performance' },
                { label: 'Content Analysis', value: 'content' },
                { label: 'User Activity', value: 'users' },
                { label: 'SEO Report', value: 'seo' }
              ]"
            />
          </UFormField>

          <UFormField label="Date Range" required>
            <USelectMenu
              v-model="generateForm.dateRange"
              :options="[
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'Last 90 days', value: '90d' },
                { label: 'Last year', value: '1y' }
              ]"
            />
          </UFormField>

          <UFormField label="Options">
            <div class="space-y-3">
              <UCheckbox
                v-model="generateForm.includeCharts"
                label="Include charts and visualizations"
              />
              <UCheckbox
                v-model="generateForm.includeRawData"
                label="Include raw data tables"
              />
            </div>
          </UFormField>

          <UFormField label="Format" required>
            <USelectMenu
              v-model="generateForm.format"
              :options="[
                { label: 'PDF', value: 'pdf' },
                { label: 'Excel (XLSX)', value: 'xlsx' },
                { label: 'CSV', value: 'csv' }
              ]"
            />
          </UFormField>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton
              type="button"
              @click="isGenerateModalOpen = false"
              color="gray"
              variant="outline"
            >
              Cancel
            </UButton>
            <UButton type="submit">
              Generate Report
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>