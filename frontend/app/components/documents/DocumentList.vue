<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Filters Sidebar -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Filters</h2>
          </template>

          <div class="space-y-6">
            <div>
              <UInput
                v-model="searchQuery"
                icon="i-heroicons-magnifying-glass"
                placeholder="Search documents..."
              />
            </div>

            <div>
              <h3 class="font-medium mb-2">Categories</h3>
              <div class="space-y-2">
                <UButton
                  v-for="tag in categoryTags"
                  :key="tag.id"
                  :variant="selectedTags.includes(tag.id) ? 'solid' : 'outline'"
                  :color="selectedTags.includes(tag.id) ? 'primary' : 'gray'"
                  size="sm"
                  block
                  @click="toggleTag(tag.id)"
                >
                  {{ tag.name }}
                </UButton>
              </div>
            </div>

            <div>
              <h3 class="font-medium mb-2">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in regularTags"
                  :key="tag.id"
                  :color="selectedTags.includes(tag.id) ? 'primary' : 'gray'"
                  :variant="selectedTags.includes(tag.id) ? 'solid' : 'soft'"
                  class="cursor-pointer"
                  @click="toggleTag(tag.id)"
                >
                  {{ tag.name }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Documents Grid -->
      <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard
            v-for="document in filteredDocuments"
            :key="document.id"
            class="group cursor-pointer"
            @click="navigateToDocument(document.id)"
          >
            <h3 class="text-lg font-semibold mb-2 group-hover:text-primary transition">
              {{ document.title }}
            </h3>
            
            <p class="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
              {{ document.excerpt }}
            </p>

            <template #footer>
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between text-sm">
                  <UBadge
                    :color="document.isPublic ? 'green' : 'yellow'"
                    :variant="document.isPublic ? 'soft' : 'subtle'"
                  >
                    {{ document.isPublic ? 'Public' : 'Private' }}
                  </UBadge>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ formatDate(document.createdAt) }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="tagId in document.tags"
                    :key="tagId"
                    :label="getTagName(tagId)"
                    variant="soft"
                    size="xs"
                  />
                </div>
              </div>
            </template>
          </UCard>
        </div>

        <!-- Empty state -->
        <div 
          v-if="filteredDocuments.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-heroicons-document"
            class="h-12 w-12 mx-auto mb-4 text-gray-400"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            No documents found
          </h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '~/stores/document'
import type { Tag } from '@/types/rules'

const router = useRouter()
const documentStore = useDocumentStore()
const { documents, tags } = storeToRefs(documentStore)

const searchQuery = ref('')
const selectedTags = ref<string[]>([])

const categoryTags = computed(() => 
  tags.value.filter(tag => tag.type === 'category')
)

const regularTags = computed(() => 
  tags.value.filter(tag => tag.type === 'tag')
)

const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.excerpt?.toLowerCase().includes(query)
    )
  }

  // Filter by selected tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(doc =>
      selectedTags.value.some(tagId => doc.tags.includes(tagId))
    )
  }

  return filtered
})

const toggleTag = (tagId: string) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const getTagName = (tagId: string) => {
  const tag = tags.value.find((t: Tag) => t.id === tagId)
  return tag?.name || ''
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const navigateToDocument = (documentId: string) => {
  router.push(`/documents/${documentId}`)
}
</script>