<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Manage Blog Articles</h2>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="showCreateModal = true"
        >
          Create New Article
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search articles..."
        size="lg"
      />
      
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="tag in tags"
          :key="tag.id"
          :variant="selectedTags.includes(tag.id) ? 'solid' : 'outline'"
          :color="selectedTags.includes(tag.id) ? 'primary' : 'gray'"
          size="sm"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </UButton>
      </div>
    </div>

    <UTable
      :rows="filteredArticles"
      :columns="[
        {
          key: 'title',
          label: 'Title',
          id: 'title'
        },
        {
          key: 'author',
          label: 'Author',
          id: 'author'
        },
        {
          key: 'status',
          label: 'Status',
          id: 'status'
        },
        {
          key: 'createdAt',
          label: 'Created',
          id: 'createdAt'
        },
        {
          key: 'actions',
          label: 'Actions',
          id: 'actions'
        }
      ]"
    >
      <template #author-data="{ row }">
        {{ getAuthorName(row.author) }}
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="row.isPremium ? 'primary' : 'gray'"
          :variant="row.isPremium ? 'solid' : 'subtle'"
        >
          {{ row.isPremium ? 'Premium' : 'Free' }}
        </UBadge>
      </template>

      <template #createdAt-data="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            @click="editArticle(row)"
          >
            Edit
          </UButton>
          <UButton
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="confirmDelete(row)"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UTable>

    <!-- Create/Edit Modal -->
    <UModal
      v-model="showModal"
      :ui="{ width: 'max-w-3xl' }"
    >
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">
            {{ editingArticle ? 'Edit Article' : 'Create New Article' }}
          </h3>
        </template>

        <div class="space-y-6">
          <UFormGroup label="Title">
            <UInput
              v-model="articleForm.title"
              placeholder="Enter article title"
              required
            />
          </UFormGroup>

          <UFormGroup label="Excerpt">
            <UTextarea
              v-model="articleForm.excerpt"
              placeholder="Enter article excerpt"
              rows="3"
              required
            />
          </UFormGroup>

          <UFormGroup label="Content">
            <TiptapEditor
              v-model="articleForm.content"
              placeholder="Write your article..."
            />
          </UFormGroup>

          <UFormGroup label="Cover Image URL">
            <UInput
              v-model="articleForm.coverImage"
              type="url"
              placeholder="Enter cover image URL"
            />
          </UFormGroup>

          <UFormGroup label="Tags">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="tag in tags"
                :key="tag.id"
                :variant="articleForm.tags.includes(tag.id) ? 'solid' : 'outline'"
                :color="articleForm.tags.includes(tag.id) ? 'primary' : 'gray'"
                size="sm"
                @click="toggleArticleTag(tag.id)"
              >
                {{ tag.name }}
              </UButton>
            </div>
          </UFormGroup>

          <UFormGroup label="Related Documents">
            <UCard class="max-h-48 overflow-y-auto">
              <div class="space-y-2">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="p-2 rounded cursor-pointer transition"
                  :class="[
                    articleForm.relatedDocuments.includes(doc.id)
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  ]"
                  @click="toggleRelatedDocument(doc.id)"
                >
                  {{ doc.title }}
                </div>
              </div>
            </UCard>
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="articleForm.isPremium"
              label="Make article premium content"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="saveArticle"
            >
              {{ editingArticle ? 'Save Changes' : 'Create Article' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Delete Article</h3>
        </template>

        <p class="text-gray-600">
          Are you sure you want to delete "{{ articleToDelete?.title }}"? This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="deleteArticle"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '~/stores/blog'
import { useDocumentStore } from '~/stores/document'
import { useAuthStore } from '~/stores/auth'
import type { BlogArticle } from '@/types/rules'

const blogStore = useBlogStore()
const documentStore = useDocumentStore()
const authStore = useAuthStore()

const { articles, tags } = storeToRefs(blogStore)
const { documents } = storeToRefs(documentStore)
const { user } = storeToRefs(authStore)

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingArticle = ref<BlogArticle | null>(null)
const articleToDelete = ref<BlogArticle | null>(null)

const showModal = computed({
  get: () => showCreateModal.value || !!editingArticle.value,
  set: (value: boolean) => {
    if (!value) {
      showCreateModal.value = false
      editingArticle.value = null
    }
  }
})

const articleForm = ref({
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  tags: [] as string[],
  relatedDocuments: [] as string[],
  isPremium: false,
})

const filteredArticles = computed(() => {
  let filtered = articles.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query)
    )
  }

  // Filter by selected tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(article =>
      selectedTags.value.some(tagId => article.tags.includes(tagId))
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

const toggleArticleTag = (tagId: string) => {
  const index = articleForm.value.tags.indexOf(tagId)
  if (index === -1) {
    articleForm.value.tags.push(tagId)
  } else {
    articleForm.value.tags.splice(index, 1)
  }
}

const toggleRelatedDocument = (docId: string) => {
  const index = articleForm.value.relatedDocuments.indexOf(docId)
  if (index === -1) {
    articleForm.value.relatedDocuments.push(docId)
  } else {
    articleForm.value.relatedDocuments.splice(index, 1)
  }
}

const getAuthorName = (authorId: string) => {
  if (authorId === user.value?.id) {
    return user.value.name
  }
  return 'Unknown Author' // In a real app, you'd fetch the author name
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const editArticle = (article: BlogArticle) => {
  editingArticle.value = article
  articleForm.value = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    coverImage: article.coverImage || '',
    tags: [...article.tags],
    relatedDocuments: [...article.relatedDocuments],
    isPremium: article.isPremium,
  }
}

const confirmDelete = (article: BlogArticle) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingArticle.value = null
  articleForm.value = {
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
    relatedDocuments: [],
    isPremium: false,
  }
}

const saveArticle = async () => {
  try {
    if (editingArticle.value) {
      await blogStore.updateArticle(editingArticle.value.id, {
        ...articleForm.value,
        author: user.value!.id,
      })
    } else {
      await blogStore.createArticle({
        ...articleForm.value,
        author: user.value!.id,
      })
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save article:', error)
    // Handle error (show notification, etc.)
  }
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return

  try {
    await blogStore.deleteArticle(articleToDelete.value.id)
    showDeleteModal.value = false
    articleToDelete.value = null
  } catch (error) {
    console.error('Failed to delete article:', error)
    // Handle error (show notification, etc.)
  }
}
</script>

