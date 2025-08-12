<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Documents</h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            Manage your legal documents
          </p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          to="/admin/documents/create"
          color="primary"
        >
          New Document
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UInput
          v-model="filters.search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search documents..."
        />
        <USelect
          v-model="filters.status"
          :options="['ALL', 'DRAFT', 'PUBLISHED']"
          placeholder="Filter by status"
          option-attribute="label"
        />
        <USelectMenu
          v-model="filters.tagId"
          :options="tagOptions"
          placeholder="Filter by tag"
        />
      </div>
    </UCard>

    <!-- Documents Table -->
    <ClientOnly>
    <UCard>
      <UTable
        :data="tableRows"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-heroicons-document',
          label: 'No documents found',
          description: loading ? 'Loading documents...' : 'Try adjusting your filters or create a new document'
        }"
      >
        <template #title-cell="{ row }">
          <div class="flex items-center gap-2">
            <UIcon
              :name="asDoc(row).isPublic ? 'i-heroicons-globe-alt' : 'i-heroicons-lock-closed'"
              class="text-gray-400"
            />
            <NuxtLink
              :to="`/documents/${asDoc(row).id}`"
              class="font-medium text-primary hover:underline"
            >
              {{ asDoc(row).title }}
            </NuxtLink>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(asDoc(row).status)"
            :variant="asDoc(row).status === 'PUBLISHED' ? 'solid' : 'soft'"
          >
            {{ asDoc(row).status }}
          </UBadge>
        </template>

        <template #creator-cell="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar
              :alt="asDoc(row).creator?.firstName + ' ' + asDoc(row).creator?.lastName"
              :text="getInitials(asDoc(row).creator)"
              size="sm"
            />
            <span>{{ asDoc(row).creator?.firstName }} {{ asDoc(row).creator?.lastName }}</span>
          </div>
        </template>

        <template #sections-cell="{ row }">
          <UBadge
            :label="asDoc(row).sections?.length.toString()"
            color="neutral"
            variant="subtle"
          />
        </template>

        <template #tags-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="meta in asDoc(row).entityMeta"
              :key="meta.id"
              :label="meta.meta.name"
              color="primary"
              variant="soft"
              size="xs"
            />
          </div>
        </template>

        <template #date-cell="{ row }">
          <span class="text-gray-600 dark:text-gray-400">
            {{ formatDate(asDoc(row).createdAt) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu
            :items="getActionItems(asDoc(row))"
            :ui="{
              item: 'gap-x-2'
            }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <!-- Pagination -->
      <template #footer>
        <div class="flex items-center justify-between gap-2 mt-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ documents.items?.length || 0 }} of {{ documents.meta.total }} documents
          </p>
          <UPagination
            v-model="currentPage"
            :total="documents.meta.total"
            :page-size="documents.meta.limit"
          />
        </div>
      </template>
    </UCard>
    </ClientOnly>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500" />
              <h3 class="text-lg font-semibold">Delete Document</h3>
            </div>
          </template>
  
          <p>Are you sure you want to delete "{{ documentToDelete?.title }}"? This action cannot be undone.</p>
  
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="soft"
                @click="showDeleteModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                @click="deleteDocument"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDocumentStore } from '@/stores/document'

// Types aligned with backend responses
interface Creator {
  id: number
  email: string
  firstName: string
  lastName: string
}

interface Section {
  id: number
  title: string
  status: string
}

interface Meta {
  id: number
  name: string
  description: string | null
  slug: string
  type: string
}

interface EntityMeta {
  id: number
  meta: Meta
}

interface DocumentItem {
  id: number
  title: string
  summary: string
  content: string
  status: string
  isPublic: boolean
  creatorId: number
  createdAt: string
  updatedAt: string
  creator: Creator
  sections: Section[]
  entityMeta: EntityMeta[]
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface DocumentsResponse {
  items: DocumentItem[]
  meta: PaginationMeta
}

const loading = ref(false)
const currentPage = ref(1)
const showDeleteModal = ref(false)
const documentToDelete = ref<DocumentItem | null>(null)
const documentStore = useDocumentStore()

const filters = ref({
  search: undefined,
  status: undefined,
  tagId: null as number | null,
})

const documents = ref<DocumentsResponse>({
  items: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
})

const availableTags = computed(() => {
  const tags = new Map<number, Meta>()
  documents.value.items?.forEach((doc) => {
    doc.entityMeta.forEach((em) => {
      tags.set(em.meta.id, em.meta)
    })
  })
  return Array.from(tags.values())
})

const tagOptions = computed(() => availableTags.value.map(t => ({ label: t.name, value: t.id })))

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'creator', header: 'Creator' },
  { accessorKey: 'sections', header: 'Sections' },
  { accessorKey: 'tags', header: 'Tags' },
  { accessorKey: 'date', header: 'Created' },
  { accessorKey: 'actions', header: '' },
]

const tableRows = computed(() => documents.value.items ?? [])

function getStatusColor(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    default:
      return 'neutral'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function getActionItems(doc: DocumentItem) {
  return [
    [
      {
        label: 'View',
        icon: 'i-heroicons-eye',
        to: `/documents/${doc.id}`,
      },
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        to: `/admin/documents/${doc.id}/edit`,
      },
    ],
    [
      doc.status !== 'PUBLISHED' && {
        label: 'Publish',
        icon: 'i-heroicons-arrow-up-on-square',
        click: () => publishDocument(doc.id),
      },
    ].filter(Boolean),
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => confirmDelete(doc),
      },
    ],
  ]
}

function confirmDelete(doc: DocumentItem) {
  documentToDelete.value = doc
  showDeleteModal.value = true
}

async function deleteDocument() {
  if (!documentToDelete.value) return
  try {
    await documentStore.deleteDocument(documentToDelete.value.id.toString())
    showDeleteModal.value = false
    documentToDelete.value = null
    await documentStore.fetchDocuments(currentPage.value, documents.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
  } catch (error) {
    console.error('Failed to delete document:', error)
  }
}

async function publishDocument(documentId: number) {
  try {
    documentStore.updateDocument(documentId.toString(), { status: 'PUBLISHED' })
    await documentStore.fetchDocuments(currentPage.value, documents.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
  } catch (error) {
    console.error('Failed to publish document:', error)
  }
}

async function fetchDocuments(page: number, limit: number, search: string | undefined, status: string | undefined, tagId: number | null) {
  loading.value = true
  try {
    const res = await documentStore.fetchDocuments(page, limit, search, status, tagId)
    documents.value = res as unknown as DocumentsResponse
  } catch (e) {
    console.error('Failed to fetch documents:', e)
  } finally {
    loading.value = false
  }
}

watch([currentPage, filters], () => {
  fetchDocuments(currentPage.value, documents.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
}, { deep: true })

onMounted(() => {
  fetchDocuments(currentPage.value, documents.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
})

function asDoc(row: unknown): DocumentItem {
  const possible = row as { original?: DocumentItem }
  return possible.original as DocumentItem
}

function getInitials(creator: Creator): string {
  const first = creator?.firstName?.[0] || ''
  const last = creator?.lastName?.[0] || ''
  return `${first}${last}` || 'U'
}
</script>