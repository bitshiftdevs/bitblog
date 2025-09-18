<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db, storage } from '@/lib/utils/firebase'
import { useEditorStore } from '@/stores/editorStore'

interface ImageType {
  id: string
  src: string
  alt: string
  thumbnail: string
  fileName: string
  storagePath: string
}
const editorStore = useEditorStore()

const props = defineProps<{
  editor: any // Consider importing proper Editor type from @tiptap/core
}>()

const emit = defineEmits<{
  (e: 'update:showImageModal', value: boolean): void
  (e: 'update-featured-image', value: string): void
}>()

// Reactive state
const imageUrl = ref('')
const imageAlt = ref('')
const imageWidth = ref('')
const imageHeight = ref('')
const activeTab = ref<'url' | 'upload' | 'library'>('url')
const imageLibrary = ref<ImageType[]>([])
const selectedLibraryImage = ref<ImageType | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const isLoadingLibrary = ref(true)
const isDeleting = ref(false)
const errorMessage = ref('')
const uploadedImageUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Initialize Firebase Storage and Firestore
onMounted(async () => {
  await loadImageLibrary()
})

async function loadImageLibrary() {
  isLoadingLibrary.value = true
  errorMessage.value = ''

  try {
    const imageCollection = collection(db, 'images')
    const imageSnapshot = await getDocs(imageCollection)

    const images: ImageType[] = []
    imageSnapshot.forEach((doc) => {
      const data = doc.data()
      images.push({
        id: doc.id,
        src: data.url,
        alt: data.alt || 'Image',
        thumbnail: data.thumbnailUrl || data.url,
        fileName: data.fileName,
        storagePath: data.storagePath,
      })
    })

    imageLibrary.value = images
  } catch (error) {
    console.error('Error loading image library:', error)
    errorMessage.value = 'Failed to load image library. Please try again.'
  } finally {
    isLoadingLibrary.value = false
  }
}

function insertImage() {
  let src = ''

  if (activeTab.value === 'url' && imageUrl.value) {
    src = imageUrl.value
  } else if (activeTab.value === 'upload' && uploadedImageUrl.value) {
    src = uploadedImageUrl.value
  } else if (activeTab.value === 'library' && selectedLibraryImage.value) {
    src = selectedLibraryImage.value.src
    if (!imageAlt.value) imageAlt.value = selectedLibraryImage.value.alt
  }

  if (src && !editorStore.isFeatured) {
    const attrs: Record<string, any> = {
      src,
      alt: imageAlt.value,
    }

    if (imageWidth.value) attrs.width = imageWidth.value
    if (imageHeight.value) attrs.height = imageHeight.value

    props.editor.chain().focus().setImage(attrs).run()
  } else if (src && editorStore.isFeatured) {
    editorStore.setFeaturedImage(src)
  }

  resetForm()
}

function resetForm() {
  imageUrl.value = ''
  imageAlt.value = ''
  imageWidth.value = ''
  imageHeight.value = ''
  selectedLibraryImage.value = null
  uploadedImageUrl.value = ''
  uploadProgress.value = 0
  isUploading.value = false
  errorMessage.value = ''
  editorStore.resetModal()
}

async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Check file size (limit to 5MB for example)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File is too large. Maximum size is 5MB.'
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Only image files are allowed.'
    return
  }

  errorMessage.value = ''

  // Preview the image locally before upload
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload to Firebase
  await uploadToFirebase(file)
}

async function uploadToFirebase(file: File) {
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''

  try {
    // Create a unique filename
    const timestamp = new Date().getTime()
    const fileName = `${timestamp}_${file.name}`
    const fileRef = storageRef(storage, `images/${fileName}`)

    // Start the upload
    const uploadTask = uploadBytesResumable(fileRef, file)

    // Listen for state changes
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Update progress
        uploadProgress.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      },
      (error) => {
        // Handle errors
        console.error('Upload failed:', error)
        errorMessage.value = 'Upload failed. Please try again.'
        isUploading.value = false
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        uploadedImageUrl.value = downloadURL

        // Save image metadata to Firestore
        try {
          await addDoc(collection(db, 'images'), {
            url: downloadURL,
            alt: file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension as alt
            fileName: file.name,
            storagePath: `images/${fileName}`,
            thumbnailUrl: downloadURL, // For simplicity, using same URL for thumbnail
            uploadedAt: new Date(),
          })

          // Refresh library
          await loadImageLibrary()
        } catch (error) {
          console.error('Error saving image metadata:', error)
          errorMessage.value = 'Error saving image metadata. Image may not appear in library.'
        }

        isUploading.value = false
      },
    )
  } catch (error) {
    console.error('Error starting upload:', error)
    errorMessage.value = 'Error starting upload. Please try again.'
    isUploading.value = false
  }
}

function selectLibraryImage(image: ImageType | null) {
  selectedLibraryImage.value = image
}

async function deleteLibraryImage(image: ImageType, event: Event) {
  // Stop the click event from selecting the image
  event.stopPropagation()

  if (!confirm(`Are you sure you want to delete this image?`)) {
    return
  }

  isDeleting.value = true
  errorMessage.value = ''

  try {
    // Delete from storage
    if (image.storagePath) {
      const fileRef = storageRef(storage, image.storagePath)
      await deleteObject(fileRef)
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'images', image.id))

    // If the deleted image was selected, clear selection
    if (selectedLibraryImage.value?.id === image.id) {
      selectedLibraryImage.value = null
    }

    // Refresh the library
    await loadImageLibrary()
  } catch (error) {
    console.error('Error deleting image:', error)
    errorMessage.value = 'Failed to delete image. Please try again.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="editorStore.showImageModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg">Insert Image</h3>

        <!-- Tabs -->
        <div class="tabs tabs-boxed mt-4">
          <button :class="`tab ${activeTab === 'url' ? 'tab-active' : ''}`" @click="activeTab = 'url'">
            URL
          </button>
          <button :class="`tab ${activeTab === 'upload' ? 'tab-active' : ''}`" @click="activeTab = 'upload'">
            Upload
          </button>
          <button :class="`tab ${activeTab === 'library' ? 'tab-active' : ''}`" @click="activeTab = 'library'">
            Library
          </button>
        </div>

        <!-- Error Messages -->
        <div v-if="errorMessage" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current shrink-0" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="mt-4">
          <!-- URL Tab -->
          <div v-if="activeTab === 'url'">
            <div class="form-control w-full">
              <label for="" class="label">
                <span class="label-text">Image URL</span>
              </label>
              <input type="text" v-model="imageUrl" placeholder="https://example.com/image.jpg"
                class="input input-bordered w-full" />
            </div>
          </div>

          <!-- Upload Tab -->
          <div v-if="activeTab === 'upload'">
            <div class="form-control w-full">
              <label for="" class="label">
                <span class="label-text">Upload Image</span>
              </label>
              <input type="file" accept="image/*" @change="handleFileSelect" ref="fileInput"
                class="file-input file-input-bordered w-full" />

              <div v-if="isUploading" class="mt-2">
                <progress class="progress progress-primary w-full" :value="uploadProgress" max="100"></progress>
                <p class="text-sm mt-1">Uploading: {{ uploadProgress }}%</p>
              </div>

              <div v-if="uploadedImageUrl" class="mt-4">
                <img :src="uploadedImageUrl" alt="Preview" class="max-h-40 rounded-md shadow-md" />
              </div>
            </div>
          </div>

          <!-- Library Tab -->
          <div v-if="activeTab === 'library'">
            <div v-if="isLoadingLibrary" class="flex justify-center items-center p-8">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
            <div v-else-if="imageLibrary.length === 0" class="p-8 text-center text-gray-500">
              <p>No images found in the library</p>
            </div>
            <div v-else class="grid grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto">
              <div v-for="image in imageLibrary" :key="image.id" aria-roledescription="url" :class="`relative cursor-pointer border rounded-md p-2 group ${selectedLibraryImage?.id === image.id
                  ? 'border-primary border-2'
                  : 'border-gray-200'
                }`" @click="selectLibraryImage(image)">
                <img :src="image.thumbnail" :alt="image.alt" class="w-full h-24 object-cover" />
                <p class="text-xs mt-1 truncate">{{ image.alt }}</p>

                <!-- Delete button -->
                <button aria-label="delete"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click.stop="deleteLibraryImage(image, $event)" :disabled="isDeleting" title="Delete image">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Common Fields for All Tabs -->
        <div class="form-control w-full mt-4">
          <label for="" class="label">
            <span class="label-text">Alt Text</span>
          </label>
          <input type="text" v-model="imageAlt" placeholder="Image description" class="input input-bordered w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4 mt-2">
          <div class="form-control w-full">
            <label for="" class="label">
              <span class="label-text">Width (optional)</span>
            </label>
            <input type="text" v-model="imageWidth" placeholder="e.g., 300px or 50%"
              class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full">
            <label for="" class="label">
              <span class="label-text">Height (optional)</span>
            </label>
            <input type="text" v-model="imageHeight" placeholder="e.g., 200px" class="input input-bordered w-full" />
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="resetForm">Cancel</button>
          <button class="btn btn-primary" @click="insertImage" :disabled="(activeTab === 'url' && !imageUrl) ||
            (activeTab === 'upload' && !uploadedImageUrl) ||
            (activeTab === 'library' && !selectedLibraryImage) ||
            isUploading ||
            isDeleting
            ">
            Insert
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
