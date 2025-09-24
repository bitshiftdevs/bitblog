<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

// Mock analytics data
const analyticsData = ref({
  overview: {
    totalViews: 45234,
    uniqueVisitors: 12456,
    avgSessionDuration: '2m 34s',
    bounceRate: 42.3
  },
  timeframe: '30d',
  chartData: {
    pageViews: [
      { date: '2024-01-01', views: 1200 },
      { date: '2024-01-02', views: 1350 },
      { date: '2024-01-03', views: 980 },
      { date: '2024-01-04', views: 1450 },
      { date: '2024-01-05', views: 1680 },
      { date: '2024-01-06', views: 1890 },
      { date: '2024-01-07', views: 2100 }
    ],
    referrers: [
      { source: 'Google', visits: 8234, percentage: 45.2 },
      { source: 'Direct', visits: 5432, percentage: 29.8 },
      { source: 'Twitter', visits: 2345, percentage: 12.9 },
      { source: 'LinkedIn', visits: 1234, percentage: 6.8 },
      { source: 'Others', visits: 967, percentage: 5.3 }
    ],
    popularPosts: [
      { title: 'Getting Started with TypeScript', views: 3456, slug: 'typescript-guide' },
      { title: 'Modern CSS Layout Techniques', views: 2890, slug: 'css-layouts' },
      { title: 'Vue 3 Composition API Deep Dive', views: 2345, slug: 'vue3-composition' },
      { title: 'Building Responsive Components', views: 1876, slug: 'responsive-components' },
      { title: 'JavaScript Performance Tips', views: 1654, slug: 'js-performance' }
    ],
    countries: [
      { country: 'United States', flag: '🇺🇸', visits: 6789 },
      { country: 'United Kingdom', flag: '🇬🇧', visits: 2345 },
      { country: 'Canada', flag: '🇨🇦', visits: 1876 },
      { country: 'Germany', flag: '🇩🇪', visits: 1543 },
      { country: 'France', flag: '🇫🇷', visits: 1234 }
    ]
  }
});

const timeframeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' }
];

const selectedTimeframe = ref('30d');

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getPercentageColor = (percentage: number) => {
  if (percentage >= 40) return 'text-green-600 dark:text-green-400';
  if (percentage >= 20) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Analytics' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Track your site performance and visitor insights
        </p>
      </div>
      <USelectMenu
        v-model="selectedTimeframe"
        :options="timeframeOptions"
      />
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-lucide-eye" class="w-8 h-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatNumber(analyticsData.overview.totalViews) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-lucide-users" class="w-8 h-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Visitors</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatNumber(analyticsData.overview.uniqueVisitors) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-lucide-clock" class="w-8 h-8 text-purple-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Session</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ analyticsData.overview.avgSessionDuration }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-lucide-trending-down" class="w-8 h-8 text-orange-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ analyticsData.overview.bounceRate }}%
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Page Views Chart -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Page Views Over Time</h3>
        </template>
        <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
          <div class="text-center">
            <UIcon name="i-lucide-bar-chart-3" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">Integration with Chart.js or similar</p>
          </div>
        </div>
      </UCard>

      <!-- Traffic Sources -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Traffic Sources</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="referrer in analyticsData.chartData.referrers"
            :key="referrer.source"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ referrer.source }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatNumber(referrer.visits) }}
              </span>
              <span :class="getPercentageColor(referrer.percentage)" class="text-sm font-medium">
                {{ referrer.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Content Performance -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Popular Posts -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Popular Posts</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="(post, index) in analyticsData.chartData.popularPosts"
            :key="post.slug"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded flex items-center justify-center">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ post.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  /posts/{{ post.slug }}
                </p>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatNumber(post.views) }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">views</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Geographic Data -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Top Countries</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="country in analyticsData.chartData.countries"
            :key="country.country"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <span class="text-lg">{{ country.flag }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ country.country }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatNumber(country.visits) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">visits</div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Real-time Stats -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Real-time Overview</h3>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">
            23
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Active Users Right Now
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            156
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Page Views Today
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
            89
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            New Visitors Today
          </div>
        </div>
      </div>
    </UCard>

    <!-- Export & Settings -->
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          Export Analytics Data
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Download detailed reports for further analysis
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <UButton color="gray" variant="outline" size="sm">
          Export CSV
        </UButton>
        <UButton color="gray" variant="outline" size="sm">
          Export PDF
        </UButton>
      </div>
    </div>
  </div>
</template>