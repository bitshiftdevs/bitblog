<script setup lang="ts">
// Meta tags
useSeoMeta({
  title: 'Home',
  ogTitle: 'Home',
  description: 'Welcome to our blog platform where great stories are shared',
  ogDescription: 'Welcome to our blog platform where great stories are shared',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
});

// Stores
const auth = useAuth();

// Fetch featured posts (non-blocking)
const { data: featuredPostsData, pending } = useLazyFetch('/api/posts', {
  key: 'home-featured-posts',
  query: {
    status: 'published',
    limit: 6,
    sortBy: 'viewCount',
    sortOrder: 'desc',
  },
});

const featuredPosts = computed(() => featuredPostsData.value?.data?.items || []);

// Fetch popular categories (non-blocking)
const { data: categoriesData, pending: categoriesLoading } = useLazyFetch('/api/categories', {
  key: 'home-categories',
  query: {
    limit: 8,
    sortBy: 'posts',
    sortOrder: 'desc',
  },
});

const categories = computed(() => categoriesData.value?.data?.items || []);

// Fetch active authors (non-blocking)
const { data: authorsData, pending: authorsLoading } = useLazyFetch('/api/authors', {
  key: 'home-authors',
  query: {
    limit: 8,
    sortBy: 'posts',
    sortOrder: 'desc',
  },
});

const authors = computed(() => authorsData.value?.data?.items || []);
</script>
<template>
  <div class="min-h-screen bg-default text-highlighted">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-24 sm:py-32 border-b border-default bg-gradient-to-b from-primary/5 to-transparent">
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Welcome to
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">BitBlog</span>
          </h1>

          <p class="text-xl md:text-2xl text-muted font-light mb-10 max-w-3xl mx-auto leading-relaxed">
            Discover amazing stories, insights, and knowledge from our vibrant community of writers and thinkers.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <UButton
              to="/posts"
              size="xl"
              icon="i-lucide-book-open"
              class="justify-center shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              Explore Posts
            </UButton>

            <UButton
              v-if="!auth.user"
              to="/auth"
              variant="outline"
              size="xl"
              icon="i-lucide-user-plus"
              class="justify-center backdrop-blur-sm"
            >
              Join Community
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Posts -->
    <section class="py-24 bg-default">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4 tracking-tight">
            Featured Posts
          </h2>
          <p class="text-xl text-muted max-w-2xl mx-auto">
            Discover our most popular and engaging content handpicked for you
          </p>
        </div>

        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else-if="featuredPosts?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard
            v-for="post in featuredPosts"
            :key="post.id"
            :post="post"
            :show-excerpt="true"
            class="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          />
        </div>

        <div v-else class="text-center py-20 bg-muted/20 rounded-3xl border border-default/50">
          <UIcon name="i-lucide-file-text" class="h-16 w-16 text-muted mb-6" />
          <p class="text-xl text-muted font-medium">
            No featured posts available
          </p>
        </div>

        <div class="text-center mt-16">
          <UButton to="/posts" variant="ghost" size="lg" class="group">
            View All Posts
            <UIcon name="i-lucide-arrow-right" class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </UButton>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-24 bg-muted/10 border-y border-default">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4 tracking-tight">
            Explore Categories
          </h2>
          <p class="text-xl text-muted max-w-2xl mx-auto">
            Dive into topics that interest you the most
          </p>
        </div>

        <div v-if="categoriesLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CategoryCardSkeleton v-for="i in 8" :key="i" />
        </div>

        <div v-else-if="categories?.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CategoryCard
            v-for="category in categories"
            :key="category.id"
            :category="category"
            class="hover:shadow-lg transition-shadow duration-300"
          />
        </div>

        <div class="text-center mt-12">
          <UButton to="/categories" variant="ghost" size="lg" class="group">
            Browse All Categories
            <UIcon name="i-lucide-arrow-right" class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </UButton>
        </div>
      </div>
    </section>

    <!-- Newsletter Signup -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-background/50 backdrop-blur-md rounded-3xl p-12 border border-default/50 shadow-xl">
        <h2 class="text-4xl font-bold mb-6">Stay Updated</h2>
        <p class="text-xl text-muted mb-10">
          Get the latest posts, exclusive content, and updates delivered straight to your inbox
        </p>
        <NewsletterSignup class="max-w-md mx-auto" />
      </div>
    </section>

    <!-- Recent Authors -->
    <section class="py-24 bg-default border-t border-default">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4 tracking-tight">
            Meet Our Top Authors
          </h2>
          <p class="text-xl text-muted max-w-2xl mx-auto">
            The talented minds sharing their knowledge and experiences
          </p>
        </div>

        <div v-if="authorsLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AuthorCardSkeleton v-for="i in 8" :key="i" />
        </div>

        <div v-else-if="authors?.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AuthorCard
            v-for="author in authors.slice(0, 8)"
            :key="author.id"
            :author="author"
            class="hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          />
        </div>

        <div class="text-center mt-16">
          <UButton to="/authors" variant="outline" size="lg" class="group">
            View All Authors
            <UIcon name="i-lucide-arrow-right" class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
