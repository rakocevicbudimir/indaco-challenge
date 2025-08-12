<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Edit Blog Post</h2>
        <div class="flex gap-2">
          <UButton color="neutral" variant="soft" @click="goBack">Cancel</UButton>
          <UButton color="primary" :loading="saving" @click="save">Save Changes</UButton>
        </div>
      </div>
    </template>

    <div v-if="loading" class="py-10 flex justify-center"><ULoader /></div>
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 space-y-4">
          <UInput v-model="form.title" size="lg" placeholder="Post title..." />
          <UTextarea v-model="form.excerpt" rows="3" placeholder="Short summary..." />
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
              <UBadge v-for="t in form.tags" :key="t" class="cursor-pointer" variant="subtle" @click="removeTag(t)">{{ t }}</UBadge>
            </div>
            <UInput v-model="newTag" placeholder="Add tag and press Enter" @keyup.enter="addTag" />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-medium">Related Documents</h3>
            </template>
            <div class="flex flex-wrap gap-2">
              <UBadge v-for="t in form.relatedDocuments" :key="t" class="cursor-pointer" variant="subtle" @click="removeRelatedDocument(t)">{{ t }}</UBadge>
            </div>
            <UInput v-model="newRelatedDocument" placeholder="Add related document and press Enter" @keyup.enter="addRelatedDocument" />
          </UCard>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TiptapNovelEditor from '@/components/TiptapNovelEditor.vue'
import { useBlogStore } from '@/stores/blog'
import { useMetaStore } from '@/stores/meta'

const metaStore = useMetaStore()
const blogStore = useBlogStore()
const router = useRouter()
const route = useRoute()

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
const newRelatedDocument = ref('')
const saving = ref(false)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  const article = await blogStore.fetchArticle(id)
  if (article) {
    form.value.title = (article as any).title || ''
    form.value.excerpt = (article as any).summary || ''
    form.value.content = (article as any).content || ''
    form.value.isPremium = !!(article as any).isPremium
    coverImage.value = (article as any).coverImage || ''
    // derive tags from entityMeta
    form.value.tags = ((article as any).entityMeta || []).map((em: any) => em?.meta?.name).filter(Boolean)
    // derive related documents from fromReferences content
    form.value.relatedDocuments = ((article as any).fromReferences || []).map((r: any) => r?.content).filter(Boolean)
  }
  loading.value = false
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

function addRelatedDocument() {
  if (!newRelatedDocument.value.trim()) return
  if (!form.value.relatedDocuments.includes(newRelatedDocument.value.trim())) {
    form.value.relatedDocuments.push(newRelatedDocument.value.trim())
  }
  newRelatedDocument.value = ''
}

function removeRelatedDocument(document: string) {
  form.value.relatedDocuments = form.value.relatedDocuments.filter((d) => d !== document)
}

async function save() {
  saving.value = true
  try {
    const metasPayload = { metas: form.value.tags.map(t => ({ name: t, type: 'tag' })) }
    const meta = await metaStore.createMeta(metasPayload as any)
    const metasIds = meta.results.map((m) => Number(m.id))

    const payload = {
      title: form.value.title,
      summary: form.value.excerpt,
      content: form.value.content,
      status: 'DRAFT' as const,
      isPremium: form.value.isPremium,
      metaIds: metasIds,
      coverImage: coverImage.value || undefined,
      toReferences: form.value.relatedDocuments.map(d => ({ content: d, toEntityId: 1, toEntityType: 'document' })),
    }
    await blogStore.updateArticle(Number(route.params.id), payload as any)
    router.push('/admin/blog')
  } finally {
    saving.value = false
  }
}

function goBack() { router.push('/admin/blog') }
</script>


