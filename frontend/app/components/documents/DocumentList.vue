<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search documents..."
        size="lg"
        class="max-w-xl"
      />

      <div class="mt-4 flex flex-wrap gap-2">
        <UButton
          v-for="tag in availableTags"
          :key="tag.id"
          :variant="selectedTagId === tag.id ? 'solid' : 'outline'"
          :color="selectedTagId === tag.id ? 'primary' : 'neutral'"
          size="sm"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="doc in items"
        :key="doc.id"
        class="group cursor-pointer"
        @click="navigateToDocument(doc.id)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-500">{{ formatDate(doc.createdAt) }}</span>
          <UBadge v-if="!doc.isPublic" color="primary" variant="solid">Private</UBadge>
        </div>

        <h2 class="text-xl font-semibold mb-2 group-hover:text-primary transition">
          {{ doc.title }}
        </h2>

        <p v-if="doc.summary" class="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
          {{ doc.summary }}
        </p>

        <template #footer>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{{ getCreatorName(doc.creator) }}</span>
              <span>{{ formatDate(doc.createdAt) }}</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="em in doc.entityMeta"
                :key="em.id"
                :label="em.meta?.name"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>

    <div v-if="!loading && items.length === 0" class="text-center py-12">
      <UIcon
        name="i-heroicons-document-text"
        class="h-12 w-12 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        No documents found
      </h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Try adjusting your search or filter criteria
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-6">
      <ULoader />
    </div>

    <div ref="loadMoreRef" class="h-1" />
  </div>
  </template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '~/stores/document'

const router = useRouter()
const documentStore = useDocumentStore()

const searchQuery = ref('')
const selectedTagId = ref<number | null>(null)
const page = ref(1)
const limit = ref(12)
const hasNextPage = ref(true)
const loading = ref(false)
type ListDocument = { id: number; title: string; summary?: string; createdAt: string; isPublic: boolean; creator?: { firstName?: string; lastName?: string }; entityMeta: Array<{ id: number; meta?: { id: number; name: string } }> }
const items = ref<ListDocument[]>([])
const loadMoreRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

const availableTags = computed(() => {
  const set = new Map<number, { id: number; name: string }>()
  items.value.forEach((d) => {
    (d.entityMeta || []).forEach((em) => {
      if (em?.meta?.id) set.set(em.meta.id, { id: em.meta.id, name: em.meta.name })
    })
  })
  return Array.from(set.values())
})

function toggleTag(tagId: number) {
  selectedTagId.value = selectedTagId.value === tagId ? null : tagId
  resetAndFetch()
}

function getCreatorName(creator?: { firstName?: string; lastName?: string } | number) {
  if (creator && typeof creator === 'object') {
    return `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || 'Creator'
  }
  return 'Creator'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function navigateToDocument(documentId: number) {
  router.push(`/documents/${documentId}`)
}

async function fetchPage() {
  if (loading.value || !hasNextPage.value) return
  loading.value = true
  try {
    const res = await documentStore.fetchDocuments(page.value, limit.value, searchQuery.value || undefined, undefined, selectedTagId.value)
    const data = res as { items: ListDocument[]; meta: { hasNextPage: boolean; page: number } } | undefined
    const newItems = (data?.items || [])
    items.value.push(...newItems)
    const meta = data?.meta as { hasNextPage: boolean; page: number } | undefined
    hasNextPage.value = !!meta?.hasNextPage
    page.value = ((meta?.page ?? page.value) + 1)
  } finally {
    loading.value = false
  }
}

function resetAndFetch() {
  items.value = []
  page.value = 1
  hasNextPage.value = true
  fetchPage()
}

onMounted(() => {
  resetAndFetch()
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fetchPage()
      }
    })
  })
  if (loadMoreRef.value) observer.observe(loadMoreRef.value)
})

onBeforeUnmount(() => {
  if (observer && loadMoreRef.value) observer.unobserve(loadMoreRef.value)
  observer = null
})

watch(searchQuery, () => {
  resetAndFetch()
})
</script>