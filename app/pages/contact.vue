<script setup lang="ts">
useSeoMeta({
  title: 'Contact Us',
  description: "Get in touch with our team. We'd love to hear from you.",
});

const toast = useToast();

const isSubmitting = ref(false);
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
});

const submitForm = async () => {
  isSubmitting.value = true;

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    });

    toast.add({
      title: 'Message sent!',
      description: "Thank you for your message. We'll get back to you soon.",
      color: 'success',
    });

    // Reset form
    Object.assign(form, {
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  } catch (error: any) {
    toast.add({
      title: 'Failed to send message',
      description: error.data?.message || 'Please try again later.',
      color: 'error',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-2xl mx-auto">
      <h1
        class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
      >
        Contact Us
      </h1>

      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
        Have a question or feedback? We'd love to hear from you.
      </p>

      <UCard class="p-8">
        <UForm :state="form" @submit.prevent="submitForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Name" required>
              <UInput
                v-model="form.name"
                placeholder="Your name"
                required
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Your email"
                required
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <UFormField label="Subject" required>
            <UInput
              v-model="form.subject"
              placeholder="What's this about?"
              required
              :disabled="isSubmitting"
            />
          </UFormField>

          <UFormField label="Message" required>
            <UTextarea
              v-model="form.message"
              placeholder="Your message..."
              :rows="6"
              required
              :disabled="isSubmitting"
            />
          </UFormField>

          <UButton type="submit" :loading="isSubmitting" block size="lg">
            Send Message
          </UButton>
        </UForm>
      </UCard>

      <!-- Contact Information -->
      <div class="mt-12 text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Other Ways to Reach Us
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <UIcon
              name="i-lucide-mail"
              class="h-8 w-8 text-primary-600 mx-auto mb-2"
            />
            <h3 class="font-medium text-gray-900 dark:text-white">Email</h3>
            <p class="text-gray-600 dark:text-gray-300">
              hello@blogplatform.com
            </p>
          </div>

          <div>
            <UIcon
              name="i-lucide-message-circle"
              class="h-8 w-8 text-primary-600 mx-auto mb-2"
            />
            <h3 class="font-medium text-gray-900 dark:text-white">Support</h3>
            <p class="text-gray-600 dark:text-gray-300">
              support@blogplatform.com
            </p>
          </div>

          <div>
            <UIcon
              name="i-lucide-building-office"
              class="h-8 w-8 text-primary-600 mx-auto mb-2"
            />
            <h3 class="font-medium text-gray-900 dark:text-white">Business</h3>
            <p class="text-gray-600 dark:text-gray-300">
              business@blogplatform.com
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
