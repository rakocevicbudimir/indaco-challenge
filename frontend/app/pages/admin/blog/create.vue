<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Create Blog Post</h2>
        <div class="flex gap-2">
          <UButton color="neutral" variant="soft" @click="goBack">Cancel</UButton>
          <UButton color="primary" :loading="saving" @click="save">Save</UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 space-y-4">
          <UInput v-model="form.title" size="lg" placeholder="Post title..." />
          <UTextarea v-model="form.excerpt" :rows="3" placeholder="Short summary..." />
          <TiptapNovelEditor v-model="form.content" placeholder="Start writing..." />
        </div>

        <div class="lg:col-span-1 space-y-4">
          <UCard>
            <template #header>
              <h3 class="font-medium">Settings</h3>
            </template>
            <div class="space-y-4">
              <UCheckbox v-model="form.isPremium" label="Premium" />
              <UInput v-model="coverImage" placeholder="Cover image URL" />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-medium">Tags</h3>
            </template>
            <div class="flex flex-wrap gap-2">
              <UBadge v-for="t in form.tags" :key="t" class="cursor-pointer" variant="subtle" @click="removeTag(t)">{{ t
                }}
              </UBadge>
            </div>
            <UInput v-model="newTag" placeholder="Add tag and press Enter" @keyup.enter="addTag" />
          </UCard>
          <UCard>
            <template #header>
              <h3 class="font-medium">Related Content</h3>
            </template>
            <div class="space-y-3">
              <USelectMenu
                v-model="selectedRelatedDocuments"
                :items="liveDocumentOptions"
                multiple
                searchable
                placeholder="Select related documents..."
              />
              <USelectMenu
                v-model="selectedRelatedArticles"
                :items="liveArticleOptions"
                multiple
                searchable
                placeholder="Select related blog posts..."
              />
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TiptapNovelEditor from '@/components/TiptapNovelEditor.vue'
import { useBlogStore } from '@/stores/blog'
import { useMetaStore } from '@/stores/meta'
import { useDocumentStore } from '@/stores/document'

const metaStore = useMetaStore()
const blogStore = useBlogStore()
const documentStore = useDocumentStore()
const router = useRouter()

const form = ref({
  title: '',
  excerpt: '',
  content: '',
  isPremium: false,
  tags: [] as string[],
  relatedDocuments: [] as string[],
})

const coverImage = ref('')
const newTag = ref('')
const saving = ref(false)

// Related content multi-selects
type Option = { label: string; id: string }

const selectedRelatedDocuments = ref<Option[]>([])
const selectedRelatedArticles = ref<Option[]>([])
const documentOptions = ref<Option[]>([])
const liveDocumentOptions = computed<Option[]>(() => documentOptions.value)
const articleOptions = ref<Option[]>([])
const liveArticleOptions = computed<Option[]>(() => articleOptions.value)

async function loadRelatedOptions() {
  // Fetch first page of documents and articles for options; can be extended to lazy-searchable later
  const [docsPage, articlesPage] = await Promise.all([
    documentStore.fetchDocuments(1, 50, undefined, undefined, null),
    blogStore.fetchArticles(1, 50, undefined, undefined, null),
  ])

  const docs = (docsPage?.items || []) as Array<{ id: string; title: string }>
  const arts = (articlesPage?.items || []) as Array<{ id: number; title: string }>

  console.log(docs)
  console.log(arts)

  documentOptions.value = docs.map(d => ({ label: d.title, id: d.id }))
  articleOptions.value = arts.map(a => ({ label: a.title, id: String(a.id) }))
}

onMounted(() => {
  loadRelatedOptions()
})

function addTag() {
  if (!newTag.value.trim()) return
  if (!form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
  }
  newTag.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

// removed legacy add/remove related document helpers in favor of multi-selects

async function save() {
  saving.value = true
  try {
    type CreateMetasPayload = { metas: Array<{ name: string; type: 'tag' | 'category' }> }
    const metasPayload: CreateMetasPayload = {
      metas: form.value.tags.map(t => ({ name: t, type: 'tag' })),
    }

    const meta = await metaStore.createMeta(metasPayload as unknown as CreateMetasPayload)

    const metasIds = meta.results.map((m) => Number(m.id))

    const payload = {
      title: form.value.title,
      summary: form.value.excerpt,
      content: form.value.content,
      status: 'DRAFT' as const,
      isPremium: form.value.isPremium,
      metaIds: metasIds,
      coverImage: coverImage.value || undefined,
      toReferences: [
        // Map selected documents
        ...selectedRelatedDocuments.value.map((d) => ({ content: `document:${d.id}`, toEntityId: Number(d.id), toEntityType: 'document' as const })),
        // Map selected blog posts
        ...selectedRelatedArticles.value.map((a) => ({ content: `blog:${a.id}`, toEntityId: Number(a.id), toEntityType: 'blog' as const })),
      ],
    }

    const created = await blogStore.createArticle(payload)

    router.push(`/blog/${created.id}`)
  } finally {
    saving.value = false
  }
}

function goBack() { router.push('/admin/blog') }
</script>
