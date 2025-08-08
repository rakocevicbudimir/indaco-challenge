<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Manage Legal Documents</h2>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="showCreateModal = true"
        >
          Create New Document
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search documents..."
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
      :rows="filteredDocuments"
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
          :color="row.isPublic ? 'green' : 'yellow'"
          :variant="row.isPublic ? 'solid' : 'subtle'"
        >
          {{ row.isPublic ? 'Public' : 'Private' }}
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
            @click="editDocument(row)"
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
            {{ editingDocument ? 'Edit Document' : 'Create New Document' }}
          </h3>
        </template>

        <div class="space-y-6">
          <UFormGroup label="Title">
            <UInput
              v-model="documentForm.title"
              placeholder="Enter document title"
              required
            />
          </UFormGroup>

          <UFormGroup label="Content">
            <TiptapEditor
              v-model="documentForm.content"
              placeholder="Enter document content..."
            />
          </UFormGroup>

          <UFormGroup label="Excerpt">
            <UTextarea
              v-model="documentForm.excerpt"
              placeholder="Enter document excerpt"
              rows="3"
            />
          </UFormGroup>

          <UFormGroup label="Tags">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="tag in tags"
                :key="tag.id"
                :variant="documentForm.tags.includes(tag.id) ? 'solid' : 'outline'"
                :color="documentForm.tags.includes(tag.id) ? 'primary' : 'gray'"
                size="sm"
                @click="toggleDocumentTag(tag.id)"
              >
                {{ tag.name }}
              </UButton>
            </div>
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="documentForm.isPublic"
              label="Make document public"
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
              @click="saveDocument"
            >
              {{ editingDocument ? 'Save Changes' : 'Create Document' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Delete Document</h3>
        </template>

        <p class="text-gray-600">
          Are you sure you want to delete "{{ documentToDelete?.title }}"? This action cannot be undone.
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
              @click="deleteDocument"
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
import { useDocumentStore } from '~/stores/document'
import { useAuthStore } from '~/stores/auth'
import type { LegalDocument } from '@/types/rules'

const documentStore = useDocumentStore()
const authStore = useAuthStore()

const { documents, tags } = storeToRefs(documentStore)
const { user } = storeToRefs(authStore)

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingDocument = ref<LegalDocument | null>(null)
const documentToDelete = ref<LegalDocument | null>(null)

const showModal = computed({
  get: () => showCreateModal.value || !!editingDocument.value,
  set: (value: boolean) => {
    if (!value) {
      showCreateModal.value = false
      editingDocument.value = null
    }
  }
})

const documentForm = ref({
  title: '',
  content: '',
  excerpt: '',
  tags: [] as string[],
  isPublic: false,
})

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

const toggleDocumentTag = (tagId: string) => {
  const index = documentForm.value.tags.indexOf(tagId)
  if (index === -1) {
    documentForm.value.tags.push(tagId)
  } else {
    documentForm.value.tags.splice(index, 1)
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

const editDocument = (document: LegalDocument) => {
  editingDocument.value = document
  documentForm.value = {
    title: document.title,
    content: document.content,
    excerpt: document.excerpt || '',
    tags: [...document.tags],
    isPublic: document.isPublic,
  }
}

const confirmDelete = (document: LegalDocument) => {
  documentToDelete.value = document
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingDocument.value = null
  documentForm.value = {
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    isPublic: false,
  }
}

const saveDocument = async () => {
  try {
    if (editingDocument.value) {
      await documentStore.updateDocument(editingDocument.value.id, {
        ...documentForm.value,
        author: user.value!.id,
      })
    } else {
      await documentStore.createDocument({
        ...documentForm.value,
        author: user.value!.id,
      })
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save document:', error)
    // Handle error (show notification, etc.)
  }
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return

  try {
    await documentStore.deleteDocument(documentToDelete.value.id)
    showDeleteModal.value = false
    documentToDelete.value = null
  } catch (error) {
    console.error('Failed to delete document:', error)
    // Handle error (show notification, etc.)
  }
}
</script>

