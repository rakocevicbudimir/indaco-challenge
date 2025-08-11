<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Blog Articles</h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            Manage your blog articles and content
          </p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          to="/admin/blog/create"
          color="primary"
        >
          New Article
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UInput
          v-model="filters.search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search articles..."
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

    <!-- Articles Table -->
    <UCard>
      <UTable
        :data="tableRows"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-heroicons-newspaper',
          label: 'No articles found',
          description: loading ? 'Loading articles...' : 'Try adjusting your filters or create a new article'
        }"
      >
        <template #title-cell="{ row }">
          <div class="flex items-center gap-2">
            <UIcon :name="asItem(row).isPremium ? 'i-heroicons-star' : 'i-heroicons-newspaper'" class="text-gray-400" />
            <NuxtLink :to="`/blog/${asItem(row).id}`" class="font-medium text-primary hover:underline">
              {{ asItem(row).title }}
            </NuxtLink>
          </div>
        </template>

        <template #premium-cell="{ row }">
          <UBadge :color="asItem(row).isPremium ? 'warning' : 'neutral'" :variant="asItem(row).isPremium ? 'solid' : 'subtle'">
            {{ asItem(row).isPremium ? 'Premium' : 'Free' }}
          </UBadge>
        </template>

        <template #tags-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="em in asItem(row).entityMeta"
              :key="em.id"
              :label="em.meta.name"
              color="primary"
              variant="soft"
              size="xs"
            />
          </div>
        </template>

        <template #date-cell="{ row }">
          <span class="text-gray-600 dark:text-gray-400">{{ formatDate(asItem(row).createdAt) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="getActionItems(asItem(row))">
            <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
          </UDropdownMenu>
        </template>
      </UTable>

      <!-- Pagination -->
      <template #footer>
        <div class="flex items-center justify-between gap-2 mt-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ articles.items.length }} of {{ articles.meta.total }} articles
          </p>
          <UPagination
            v-model="currentPage"
            :total="articles.meta.total"
            :page-size="articles.meta.limit"
          />
        </div>
      </template>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500" />
              <h3 class="text-lg font-semibold">Delete Article</h3>
            </div>
          </template>
  
          <p>Are you sure you want to delete "{{ articleToDelete?.title }}"? This action cannot be undone.</p>
  
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
                @click="deleteArticle"
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
import { useBlogStore } from '@/stores/blog'

const blogStore = useBlogStore()

interface Author {
  id: number
  email: string
  firstName: string
  lastName: string
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

interface Reference {
  id: number
  content: string
  fromEntityType: string
  toEntityType: string
}

interface BlogArticle {
  id: number
  title: string
  summary: string
  content: string
  status: string
  isPremium: boolean
  authorId: number
  createdAt: string
  updatedAt: string
  author: Author
  entityMeta: EntityMeta[]
  fromReferences: Reference[]
  toReferences: Reference[]
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface ArticlesResponse {
  items: BlogArticle[]
  meta: PaginationMeta
}

// State
const currentPage = ref(1)
const showDeleteModal = ref(false)
const articleToDelete = ref<BlogArticle | null>(null)

const filters = ref({
  search: '',
  status: '',
  tagId: null as number | null
})

const articles = ref<ArticlesResponse>({
  items: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }
})

// Available tags for filter
const availableTags = computed(() => {
  const tags = new Map<number, Meta>()
  articles.value.items.forEach(article => {
    article.entityMeta.forEach(em => {
      tags.set(em.meta.id, em.meta)
    })
  })
  return Array.from(tags.values())
})

const tagOptions = computed(() => availableTags.value.map(t => ({ label: t.name, value: t.id })))

const columns = [
  { id: 'title', header: 'Title' },
  { id: 'premium', header: 'Type' },
  { id: 'tags', header: 'Tags' },
  { id: 'date', header: 'Created' },
  { id: 'actions', header: '' },
]

// Utilities

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const loading = ref(false)
const tableRows = computed(() => articles.value.items)

async function fetchArticles(page: number, limit: number, search: string | undefined, status: string | undefined, tagId: number | null) {
  loading.value = true
  try {
    const res = await blogStore.fetchArticles(page, limit, search, status, tagId)
    if (res) {
      articles.value = res as unknown as ArticlesResponse
    }
  } catch (e) {
    console.error('Failed to fetch articles:', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchArticles(currentPage.value, articles.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
})

const getActionItems = (article: BlogArticle) => [
  [
    {
      label: 'View',
      icon: 'i-heroicons-eye',
      to: `/blog/${article.id}`
    },
    { label: 'Edit', icon: 'i-heroicons-pencil-square', to: `/admin/blog/${article.id}/edit` }
  ],
  [
    article.status !== 'PUBLISHED' && {
      label: 'Publish',
      icon: 'i-heroicons-arrow-up-on-square',
      click: () => publishArticle(article.id)
    }
  ].filter(Boolean),
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => confirmDelete(article)
    }
  ]
]

function asItem(row: unknown): BlogArticle {
  const possibleRow = row as { original?: BlogArticle }
  return possibleRow.original ?? (row as BlogArticle)
}

// Actions
const confirmDelete = (article: BlogArticle) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return
  
  try {
    // Add delete API call here
    showDeleteModal.value = false
    articleToDelete.value = null
    // Refresh articles list
  } catch (error) {
    console.error('Failed to delete article:', error)
  }
}

const publishArticle = async (_articleId: number) => {
  try {
    // Add publish API call here
    // Refresh articles list
  } catch (error) {
    console.error('Failed to publish article:', error)
  }
}

// Watch filters and pagination to refetch data
watch([currentPage, filters], () => {
  fetchArticles(currentPage.value, articles.value.meta.limit, filters.value.search, filters.value.status, filters.value.tagId)
}, { deep: true })
</script>