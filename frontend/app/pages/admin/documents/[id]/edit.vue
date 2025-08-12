<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Edit Legal Document</h2>
        <div class="flex gap-2">
          <UButton color="neutral" variant="soft" @click="goBack">Cancel</UButton>
          <UButton color="primary" :loading="isSaving" @click="saveDocument">Save Changes</UButton>
        </div>
      </div>
    </template>

    <div v-if="loading" class="py-10 flex justify-center"><ULoader /></div>
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <UFormGroup label="Document title">
            <UInput v-model="form.title" placeholder="Document name..." size="lg" />
          </UFormGroup>

          <UFormGroup label="Summary">
            <UTextarea v-model="form.summary" placeholder="Document summary" rows="3" />
          </UFormGroup>
        </div>

        <div class="flex items-baseline gap-2">
          <UButton icon="i-heroicons-link" size="xs" variant="outline" @click="addLink">Add Link</UButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-3">
        <ULink v-for="(lnk, idx) in form.links" :key="idx" :href="lnk.content" target="_blank" class="text-sm" @click.prevent>
          {{ lnk.content }}
          <UButton icon="i-heroicons-x-mark" size="2xs" color="neutral" variant="ghost" class="ml-1" @click="form.links.splice(idx, 1)" />
        </ULink>
        <span v-if="form.links.length === 0" class="text-gray-500 text-sm">No links</span>
      </div>

      <UFormGroup label="Document content">
        <TiptapEditor v-model="form.content" placeholder="Document content..." />
      </UFormGroup>

      <div class="flex items-center gap-4">
        <UCheckbox v-model="form.isPublic" label="Is Public" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TiptapEditor from '@/components/TiptapEditor.vue'
import { useDocumentStore } from '@/stores/document'

interface Reference { content: string }

const route = useRoute()
const router = useRouter()
const documentStore = useDocumentStore()

const loading = ref(true)
const isSaving = ref(false)

const form = ref({
  title: '',
  summary: '',
  content: '',
  isPublic: false,
  links: [] as Reference[],
})

onMounted(async () => {
  try {
    const id = String(route.params.id)
    const doc = await documentStore.fetchDocument(id)
    if (doc) {
      form.value.title = (doc as any).title || ''
      form.value.summary = (doc as any).summary || ''
      form.value.content = (doc as any).content || ''
      form.value.isPublic = (doc as any).isPublic || false
      form.value.links = ((doc as any).toReferences || []) as Reference[]
    }
  } finally {
    loading.value = false
  }
})

function addLink() {
  const url = window.prompt('Add link URL')
  if (!url) return
  form.value.links.push({ content: url })
}

async function saveDocument() {
  const id = String(route.params.id)
  isSaving.value = true
  try {
    const payload = {
      title: form.value.title,
      summary: form.value.summary,
      content: form.value.content,
      isPublic: form.value.isPublic,
      toReferences: form.value.links,
    }
    await documentStore.updateDocument(id, payload as any)
    router.push('/admin/documents')
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  router.push('/admin/documents')
}
</script>


