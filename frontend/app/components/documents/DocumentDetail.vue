<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Document Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-6">
          <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          @click="router.back()"
        >
          Back
        </UButton>
        <UBadge
          :color="getStatusColor(document?.status)"
          :variant="document?.status === 'PUBLISHED' ? 'solid' : 'soft'"
        >
          {{ document?.status }}
        </UBadge>
      </div>

      <div class="flex justify-between items-start gap-4 mb-6">
        <h1 class="text-4xl font-bold">{{ document?.title }}</h1>
        <div class="flex gap-2">
          <UButton
            v-if="document?.status !== 'PUBLISHED'"
            color="primary"
            @click="publishDocument"
          >
            Publish
          </UButton>
          <UButton
            icon="i-heroicons-pencil-square"
            color="neutral"
            variant="soft"
            :to="`/documents/${document?.id}/edit`"
          />
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b">
        <div class="flex items-center gap-4">
          <UAvatar
            v-if="document?.creator"
            :alt="document?.creator?.firstName + ' ' + document?.creator?.lastName"
            :text="(document?.creator?.firstName?.[0] || '') + (document?.creator?.lastName?.[0] || '')"
          />
          <div>
            <div class="font-medium">
              {{ document?.creator?.firstName }} {{ document?.creator?.lastName }}
            </div>
            <div class="text-sm text-neutral-600">
              {{ formatDate(document?.createdAt) }}
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <UBadge
            v-for="meta in document?.entityMeta"
            :key="meta.id"
            :label="meta.meta.name"
            variant="soft"
            class="text-sm"
          />
        </div>
      </div>
    </div>

    <UCard
      v-if="!isAuthenticated && !document?.isPublic"
      class="text-center py-12 border border-primary"
    >
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-12 w-12 mx-auto mb-4 text-primary"
      />
      <p class="text-lg mb-4">Please log in to view the full document</p>
      <UButton
        icon="i-heroicons-arrow-right-20-solid"
        @click="navigateToLogin"
      >
        Log In
      </UButton>
    </UCard>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <!-- Document Content -->
          <UCard class="mb-8">
            <div class="prose prose-lg max-w-none" v-html="document?.content" />
          </UCard>

        <!-- Sections -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Sections</h2>
              <UBadge
                :label="document?.sections.length.toString()"
                color="primary"
                variant="subtle"
              />
            </div>
          </template>
          <div class="space-y-1">
            <div
              v-for="flat in flatSections"
              :key="flat.id"
              class="py-2"
            >
              <div class="grid grid-cols-[64px_1fr_auto] items-baseline gap-3">
                <div class="text-right pr-2 font-semibold select-none">
                  {{ numberingMap[flat.id] }}
                </div>
                <div class="leading-relaxed">
                  <span class="font-medium mr-2">{{ flat.title }}</span>
                  <div
                    v-if="flat.content"
                    class="prose prose-sm max-w-none text-neutral-700 dark:text-neutral-300"
                    v-html="flat.content"
                  />

                  <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <div class="flex gap-2 items-center">
                      <span class="font-medium">Links:</span>
                      <template v-if="getSectionReferences(flat.id).length">
                        <ULink
                          v-for="reference in getSectionReferences(flat.id)"
                          :key="reference.id"
                          href="#"
                          class="underline"
                          @click.prevent="navigateToReference(reference.toDocumentId!)"
                        >{{ reference.content }}</ULink>
                      </template>
                      <span v-else class="text-neutral-400">None</span>
                    </div>

                    <UButton
                      variant="link"
                      size="xs"
                      class="px-0"
                      @click="openNotes(flat.id)"
                    >
                      View Notes
                    </UButton>
                  </div>
                </div>
                <div class="text-xs text-neutral-500 whitespace-nowrap">{{ flat.status }}</div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <aside class="space-y-6">
        <!-- Document Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Document Info</h3>
          </template>
          
          <div class="space-y-4">
            <div>
            <div class="text-sm text-neutral-600">Visibility</div>
              <div class="flex items-center gap-2">
                <UIcon
                  :name="document?.isPublic ? 'i-heroicons-globe-alt' : 'i-heroicons-lock-closed'"
                class="text-neutral-400"
                />
                {{ document?.isPublic ? 'Public' : 'Private' }}
              </div>
            </div>

            <div>
            <div class="text-sm text-neutral-600">Last Updated</div>
              <div>{{ formatDate(document?.updatedAt) }}</div>
            </div>
          </div>
        </UCard>

        <!-- References -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Referenced By</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="reference in document?.fromReferences"
              :key="reference.id"
              class="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
            >
              <div class="text-sm font-medium mb-1">
                {{ getEntityTitle(reference.fromEntityType, reference.fromDocumentId, reference.fromSectionId) }}
              </div>
              <p class="text-sm text-neutral-600">{{ reference.content }}</p>
            </div>

            <div v-if="!document?.fromReferences?.length" class="text-neutral-600 text-sm">
              No references to this document
            </div>
          </div>
        </UCard>
      </aside>
    </div>
  </div>

  <!-- Notes Modal -->
  <UModal v-model:open="showNotesModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clipboard-document-list" class="text-primary" />
            <h3 class="text-lg font-semibold">Notes</h3>
          </div>
        </template>
        <div class="space-y-3">
          <p v-if="!activeNotes.length" class="text-neutral-600 text-sm">No notes for this section</p>
          <div v-for="n in activeNotes" :key="n.id" class="p-3 rounded bg-neutral-50 dark:bg-neutral-800">
            {{ n.content }}
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton variant="soft" color="neutral" @click="showNotesModal = false">Close</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '~/stores/document'
import { useAuthStore } from '~/stores/auth'
import type { Author, EntityMeta, FullReference } from '~/types/common'

interface Section {
  id: number
  title: string
  status: string
  content?: string
  parentId?: number | null
}

interface Document {
  id: number
  title: string
  summary: string
  content: string
  status: string
  isPublic: boolean
  creatorId: number
  createdAt: string
  updatedAt: string
  creator: Author
  sections: Section[]
  entityMeta: EntityMeta[]
  fromReferences: FullReference[]
  toReferences: FullReference[]
  notes?: Array<{ id: number; sectionId: number | null; content: string }>
}

const props = defineProps<{
  documentId: string
}>()

const router = useRouter()
const documentStore = useDocumentStore()
const authStore = useAuthStore()

const { documents } = storeToRefs(documentStore)
const { isAuthenticated } = storeToRefs(authStore)
const fetchedDocument = ref<Document | null>(null)
const document = computed(() => fetchedDocument.value)

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    default:
      return 'neutral'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getSectionReferences = (sectionId: number) => {
  const list = document.value?.toReferences || []
  return list.filter((reference) => reference.fromSectionId === sectionId)
}

const getEntityTitle = (entityType: string, documentId: number | null, sectionId: number | null) => {
  if (entityType === 'document' && documentId) {
    const doc = (documents.value as unknown as Document[]).find((d) => d.id === documentId)
    return doc?.title || 'Unknown Document'
  }
  if (entityType === 'section' && documentId && sectionId) {
    const doc = (documents.value as unknown as Document[]).find((d) => d.id === documentId)
    if (doc) {
      const section = doc.sections.find((s) => s.id === sectionId)
      if (section) return `${doc.title} > ${section.title}`
    }
    return 'Unknown Section'
  }
  return 'Unknown Reference'
}

const navigateToReference = (documentId: number) => {
  router.push(`/documents/${documentId}`)
}

const navigateToLogin = () => {
  router.push('/auth/login')
}

const publishDocument = async () => {
  if (!document.value) return
  try {
    // Add publish API call here
    // await documentStore.publishDocument(document.value.id)
  } catch (error) {
    console.error('Failed to publish document:', error)
  }
}

const setup = async () => {
  const res = await documentStore.fetchDocument(props.documentId)
  console.log(res)
  fetchedDocument.value = res as unknown as Document
  // Build tree after fetch
  computeTree()
}

onMounted(() => {
  setup()
})

// --- Sections tree + numbering ---
// This can be refactored to use inputted numberings when creating the documents. Okay for now.
type SectionNode = { section: Section; children: SectionNode[] }
const sectionTree = ref<SectionNode[]>([])
const numberingMap = ref<Record<number, string>>({})
const flatSections = ref<Section[]>([])

function computeTree() {
  const flat = (document.value?.sections ?? []) as Section[]
  const idToNode = new Map<number, SectionNode>()
  flat.forEach((sec) => idToNode.set(sec.id, { section: sec, children: [] }))
  const roots: SectionNode[] = []
  idToNode.forEach((node) => {
    const parentId = node.section.parentId ?? null
    if (parentId && idToNode.has(parentId)) {
      const parent = idToNode.get(parentId)
      if (parent) parent.children.push(node)
    } else {
      roots.push(node)
    }
  })
  sectionTree.value = roots
  numberingMap.value = {}
  flatSections.value = []
  const walk = (nodes: SectionNode[], prefix: number[] = []) => {
    nodes.forEach((n, idx) => {
      const num = [...prefix, idx + 1]
      numberingMap.value[n.section.id] = num.join('.')
      flatSections.value.push(n.section)
      if (n.children.length) walk(n.children, num)
    })
  }
  walk(sectionTree.value)
}

// Notes handling
const showNotesModal = ref(false)
type NoteItem = { id: number; content: string }
const activeNotes = ref<NoteItem[]>([])
function openNotes(sectionId: number) {
  const notes = (document.value?.notes ?? []).filter((n) => n.sectionId === sectionId)
  activeNotes.value = notes.map((n) => ({ id: n.id, content: n.content }))
  showNotesModal.value = true
}
</script>