<!-- apps/web/components/NewsletterSignup.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto">
    <div class="flex flex-col sm:flex-row gap-3">
      <UInput
        v-model="email"
        type="email"
        placeholder="Enter your email"
        required
        :disabled="isLoading"
        class="flex-1"
        size="lg"
      />
      
      <UButton 
        type="submit" 
        :loading="isLoading"
        size="lg"
        color="white"
        variant="solid"
      >
        Subscribe
      </UButton>
    </div>
    
    <p class="text-xs text-primary-100 mt-3 text-center">
      No spam, unsubscribe at any time.
    </p>
  </form>
</template>

<script setup lang="ts">
const email = ref('')
const isLoading = ref(false)
const toast = useToast()

const handleSubmit = async () => {
  if (!email.value.trim()) return
  
  isLoading.value = true
  
  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value }
    })
    
    toast.add({
      title: 'Successfully subscribed!',
      description: 'Thank you for subscribing to our newsletter.',
      color: 'green'
    })
    
    email.value = ''
  } catch (error) {
    toast.add({
      title: 'Subscription failed',
      description: 'Please try again later.',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}
</script>


