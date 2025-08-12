<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Create Legal Document</h2>
        <div class="flex gap-2">
          <UButton color="neutral" variant="soft" @click="goBack">
            Cancel
          </UButton>
          <UButton color="primary" :loading="isSaving" @click="saveDocument">
            Save Document
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <UFormGroup label="Document title">
            <UInput v-model="documentForm.title" placeholder="Document name..." size="lg" />
          </UFormGroup>

          <UFormGroup label="Summary">
            <UTextarea v-model="documentForm.summary" placeholder="Document summary" :rows="3" />
          </UFormGroup>
        </div>

        <div class="flex items-baseline gap-2">
          <UPopover v-model:open="documentLinkPickerOpen">
            <UButton icon="i-heroicons-link" size="xs" variant="outline">
              Add Link
            </UButton>
            <template #content>
              <UCard>
                <div class="w-80 space-y-3">
                  <USelectMenu
                    v-model="topSelectedDocOptions"
                    :items="documentOptions"
                    multiple
                    searchable
                    placeholder="Select documents..."
                  />
                  <USelectMenu
                    v-model="topSelectedArticleOptions"
                    :items="articleOptions"
                    multiple
                    searchable
                    placeholder="Select blog posts..."
                  />
                  <div class="flex justify-end gap-2 pt-1">
                    <UButton size="xs" variant="soft" @click="clearTopLinkSelections">Clear</UButton>
                    <UButton size="xs" color="primary" @click="confirmAddTopLinks">Add</UButton>
                  </div>
                </div>
              </UCard>
            </template>
          </UPopover>
        </div>
      </div>

      <div class="mb-3">
        <UInputTags v-model="documentForm.tags" placeholder="Add tag and press Enter" />
      </div>

      <div class="flex flex-wrap gap-2 mb-3">
        <ULink
          v-for="(lnk, lIdx) in documentForm?.links"
          :key="lIdx"
          :href="lnk.content"
          target="_blank"
          class="text-sm"
          @click.prevent
        >
          {{ lnk.content }}
          <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost" class="ml-1"
                    @click="documentForm?.links.splice(lIdx, 1)" />
        </ULink>
        <span v-if="documentForm?.links.length === 0" class="text-gray-500 text-sm">No links</span>
      </div>

      <UFormGroup label="Document content">
        <TiptapEditor v-model="documentForm.content" placeholder="Document content..." />
      </UFormGroup>

      <div class="flex flex-wrap gap-3 items-center">
        <UFormGroup>
          <UCheckbox v-model="documentForm.isPublic" label="Is Public" />
        </UFormGroup>
      </div>

      <UDivider label="Articles" />

      <div class="space-y-6">
        <div
          v-for="(article, aIdx) in documentForm.articles"
          :key="article.uid"
          class="rounded border border-gray-200 dark:border-gray-800 p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <UInput v-model="article.title" placeholder="article name..." />
              <USelectMenu
                v-model="article.categoryIds"
                :options="categoryOptions"
                multiple
                placeholder="cat1, cat2..."
              />
            </div>
            <div class="flex items-center gap-2">
              <UPopover v-model:open="article.linkPickerOpen">
                <UButton icon="i-heroicons-link" size="xs" variant="outline">
                  Add Link
                </UButton>
                <template #content>
                  <UCard>
                    <div class="w-80 space-y-3">
                      <USelectMenu
                        v-model="article.linkDocSel"
                        :items="documentOptions"
                        multiple
                        searchable
                        placeholder="Select documents..."
                      />
                      <USelectMenu
                        v-model="article.linkArtSel"
                        :items="articleOptions"
                        multiple
                        searchable
                        placeholder="Select blog posts..."
                      />
                      <div class="flex justify-end gap-2 pt-1">
                        <UButton size="xs" variant="soft" @click="article.linkDocSel = []; article.linkArtSel = []">Clear</UButton>
                        <UButton size="xs" color="primary" @click="confirmAddArticleLinks(aIdx)">Add</UButton>
                      </div>
                    </div>
                  </UCard>
                </template>
              </UPopover>
              <UButton icon="i-heroicons-trash" size="xs" color="error" variant="soft" @click="removeArticle(aIdx)" />
            </div>
          </div>

          <div class="mb-3">
            <UInputTags v-model="article.tags" placeholder="Add tag and press Enter" />
          </div>

          <div class="flex flex-wrap gap-2 mb-3">
            <ULink
              v-for="(lnk, lIdx) in article.links"
              :key="lIdx"
              :href="lnk.content"
              target="_blank"
              class="text-sm"
              @click.prevent
            >
              {{ lnk.content }}
              <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost" class="ml-1"
                        @click="article.links.splice(lIdx, 1)" />
            </ULink>
            <span v-if="article.links.length === 0" class="text-gray-500 text-sm">No links</span>
          </div>

          <TiptapEditor v-model="article.content" placeholder="article content..." />

          <div class="flex gap-6 mt-3">
            <UCheckbox v-model="article.isPublic" label="Is Public" />
            <UCheckbox v-model="article.isPremium" label="Is Premium" />
          </div>

          <div class="mt-6 space-y-4">
            <UDivider label="Sections" />
            <div
              v-for="(section, sIdx) in article.sections"
              :key="section.uid"
              class="rounded border border-gray-200 dark:border-gray-800 p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <UInput v-model="section.title" placeholder="section name..." />
                </div>
                <div class="flex items-center gap-2">
                  <UPopover v-model:open="section.linkPickerOpen">
                    <UButton icon="i-heroicons-link" size="xs" variant="outline">
                      Add Link
                    </UButton>
                    <template #content>
                      <UCard>
                        <div class="w-80 space-y-3">
                          <USelectMenu
                            v-model="section.linkDocSel"
                            :items="documentOptions"
                            multiple
                            searchable
                            placeholder="Select documents..."
                          />
                          <USelectMenu
                            v-model="section.linkArtSel"
                            :items="articleOptions"
                            multiple
                            searchable
                            placeholder="Select blog posts..."
                          />
                          <div class="flex justify-end gap-2 pt-1">
                            <UButton size="xs" variant="soft" @click="section.linkDocSel = []; section.linkArtSel = []">Clear</UButton>
                            <UButton size="xs" color="primary" @click="confirmAddSectionLinks(aIdx, sIdx)">Add</UButton>
                          </div>
                        </div>
                      </UCard>
                    </template>
                  </UPopover>
                  <UButton icon="i-heroicons-trash" size="xs" color="error" variant="soft" @click="removeSection(aIdx, sIdx)" />
                </div>
              </div>

              <div class="mb-3">
                <UInputTags v-model="section.tags" placeholder="Add tag and press Enter" />
              </div>

              <div class="flex flex-wrap gap-2 mb-3">
                <ULink
                  v-for="(lnk, idx) in section.links"
                  :key="idx"
                  :href="String(lnk)"
                  target="_blank"
                  class="text-sm"
                  @click.prevent
                >
                  {{ lnk }}
                  <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost" class="ml-1"
                            @click="section.links.splice(idx, 1)" />
                </ULink>
                <span v-if="section.links.length === 0" class="text-gray-500 text-sm">No links</span>
              </div>

              <TiptapEditor v-model="section.content" placeholder="section content..." />

              <div class="flex gap-6 mt-3">
                <UCheckbox v-model="section.isPublic" label="Is Public" />
                <UCheckbox v-model="section.isPremium" label="Is Premium" />
              </div>

              <div class="mt-6 space-y-4">
                <UDivider label="Subsections" />
                <div
                  v-for="(sub, subIdx) in section.subsections"
                  :key="sub.uid"
                  class="rounded border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <UInput v-model="sub.title" placeholder="sub section name..." />

                    <div class="flex items-center gap-2">
                      <UPopover v-model:open="sub.linkPickerOpen">
                        <UButton icon="i-heroicons-link" size="xs" variant="outline">
                          Add Link
                        </UButton>
                        <template #content>
                          <UCard>
                            <div class="w-80 space-y-3">
                              <USelectMenu
                                v-model="sub.linkDocSel"
                                :items="documentOptions"
                                multiple
                                searchable
                                placeholder="Select documents..."
                              />
                              <USelectMenu
                                v-model="sub.linkArtSel"
                                :items="articleOptions"
                                multiple
                                searchable
                                placeholder="Select blog posts..."
                              />
                              <div class="flex justify-end gap-2 pt-1">
                                <UButton size="xs" variant="soft" @click="sub.linkDocSel = []; sub.linkArtSel = []">Clear</UButton>
                                <UButton size="xs" color="primary" @click="confirmAddSubSectionLinks(aIdx, sIdx, subIdx)">Add</UButton>
                              </div>
                            </div>
                          </UCard>
                        </template>
                      </UPopover>
                      <UButton icon="i-heroicons-trash" size="xs" color="error" variant="soft" @click="removeSubsection(aIdx, sIdx, subIdx)" />
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <UInputTags v-model="sub.tags" placeholder="Add tag and press Enter" />
                  </div>

                  <div class="flex flex-wrap gap-2 mb-3">
                    <ULink
                      v-for="(lnk, idx) in sub.links"
                      :key="idx"
                      :href="lnk.content"
                      target="_blank"
                      class="text-sm"
                      @click.prevent
                    >
                      {{ lnk.content }}
                      <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost" class="ml-1"
                            @click="sub.links.splice(idx, 1)" />
                    </ULink>
                    <span v-if="sub.links.length === 0" class="text-gray-500 text-sm">No links</span>
                  </div>

                  <TiptapEditor v-model="sub.content" placeholder="sub section content..." />
                  <div class="flex gap-6 mt-3">
                    <UCheckbox v-model="sub.isPublic" label="Is Public" />
                    <UCheckbox v-model="sub.isPremium" label="Is Premium" />
                  </div>
                </div>

                <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="addSubsection(aIdx, sIdx)">
                  SubSection
                </UButton>
              </div>
            </div>

            <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="addSection(aIdx)">
              Section
            </UButton>
          </div>
        </div>

        <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="addArticle">
          Article
        </UButton>
      </div>
    </div>
  </UCard>  
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import TiptapEditor from '@/components/TiptapEditor.vue'
import { useBlogStore } from '@/stores/blog'
import { useDocumentStore } from '@/stores/document'
import { useAuthStore } from '@/stores/auth'
import { useMetaStore } from '@/stores/meta'
import type { Reference } from '@/types/common'

type UID = string

type SubsectionForm = {
  uid: UID
  title: string
  content: string
  isPublic: boolean
  isPremium: boolean
  metaIds: (number | undefined)[]
  tags: string[]
  links: Partial<Reference>[]
  linkPickerOpen?: boolean
  linkDocSel?: Option[]
  linkArtSel?: Option[]
}

type SectionForm = {
  uid: UID
  title: string
  content: string
  metaIds: (number | undefined)[]
  tags: string[]
  links: Partial<Reference>[]
  linkPickerOpen?: boolean
  linkDocSel?: Option[]
  linkArtSel?: Option[]
  isPublic: boolean
  isPremium: boolean
  subsections: SubsectionForm[]
}

type ArticleForm = {
  uid: UID
  title: string
  content: string
  categoryIds: string[]
  metaIds: (number | undefined)[]
  tags: string[]
  links: Partial<Reference>[]
  linkPickerOpen?: boolean
  linkDocSel?: Option[]
  linkArtSel?: Option[]
  isPublic: boolean
  isPremium: boolean
  sections: SectionForm[]
}

const router = useRouter()
const authStore = useAuthStore()
const blogStore = useBlogStore()
const documentStore = useDocumentStore()
const metaStore = useMetaStore()

// const { tags } = storeToRefs(documentStore)
const { user } = storeToRefs(authStore)

const categoryOptions = computed(() => documentStore.getCategoryTags.map(t => ({ label: t.name, value: t.id })))

const documentForm = ref({
  title: '',
  summary: '',
  content: '',
  isPublic: false,
  metaIds: [] as (number | undefined)[],
  tags: [] as string[],
  links: [] as Partial<Reference>[],
  articles: [] as ArticleForm[],
})

const isSaving = ref(false)

// Link pickers shared options
type Option = { label: string; id: string }
const documentOptions = ref<Option[]>([])
const articleOptions = ref<Option[]>([])
const documentLinkPickerOpen = ref(false)
const topSelectedDocOptions = ref<Option[]>([])
const topSelectedArticleOptions = ref<Option[]>([])

async function loadLinkOptions() {
  const [docsPage, articlesPage] = await Promise.all([
    documentStore.fetchDocuments(1, 50, undefined, undefined, null),
    blogStore.fetchArticles(1, 50, undefined, undefined, null),
  ])
  const docs = (docsPage?.items || []) as Array<{ id: string; title: string }>
  const arts = (articlesPage?.items || []) as Array<{ id: number; title: string }>
  documentOptions.value = docs.map(d => ({ label: d.title, id: d.id }))
  articleOptions.value = arts.map(a => ({ label: a.title, id: String(a.id) }))
}

onMounted(() => {
  loadLinkOptions()
})

function clearTopLinkSelections() {
  topSelectedDocOptions.value = []
  topSelectedArticleOptions.value = []
}

function confirmAddTopLinks() {
  // Add selected documents
  documentForm.value.links.push(
    ...topSelectedDocOptions.value.map((opt) => ({ content: `document:${opt.id}`, toEntityType: 'document' as const }))
  )
  // Add selected blogs
  documentForm.value.links.push(
    ...topSelectedArticleOptions.value.map((opt) => ({ content: `blog:${opt.id}`, toEntityId: Number(opt.id), toEntityType: 'blog' as const }))
  )
  clearTopLinkSelections()
  documentLinkPickerOpen.value = false
}

function generateUid(): UID {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// toggleTopLevelTag no longer used; tags handled via UInputTags

function addArticle() {
  documentForm.value.articles.push({
    uid: generateUid(),
    title: '',
    content: '',
    categoryIds: [],
    metaIds: [],
    tags: [],
    links: [],
    linkPickerOpen: false,
    linkDocSel: [],
    linkArtSel: [],
    isPublic: false,
    isPremium: false,
    sections: [],
  })
}

function removeArticle(aIdx: number) {
  documentForm.value.articles.splice(aIdx, 1)
}

// addDocumentTag removed in favor of UInputTags

// function addDocumentLink() {
//   documentLinkPickerOpen.value = true
// }

// Tags managed via UInputTags

// function addArticleLink(aIdx: number) {
//   const article = documentForm.value.articles[aIdx]
//   if (!article) return
//   article.linkPickerOpen = true
// }

function addSection(aIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  article.sections.push({
    uid: generateUid(),
    title: '',
    content: '',
    metaIds: [],
    tags: [],
    links: [],
    linkPickerOpen: false,
    linkDocSel: [],
    linkArtSel: [],
    isPublic: false,
    isPremium: false,
    subsections: [],
  })
}

function removeSection(aIdx: number, sIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  article.sections.splice(sIdx, 1)
}

// Tags managed via UInputTags

// function addSectionLink(aIdx: number, sIdx: number) {
//   const article = documentForm.value.articles[aIdx]
//   if (!article) return
//   const section = article.sections[sIdx]
//   if (!section) return
//   section.linkPickerOpen = true
// }

function addSubsection(aIdx: number, sIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  const section = article.sections[sIdx]
  if (!section) return
  section.subsections.push({
    uid: generateUid(),
    title: '',
    content: '',
    metaIds: [],
    tags: [],
    links: [],
    linkPickerOpen: false,
    linkDocSel: [],
    linkArtSel: [],
    isPublic: false,
    isPremium: false,
  })
}

// Tags managed via UInputTags

// function addSubSectionLink(aIdx: number, sIdx: number, subIdx: number) {
//   const article = documentForm.value.articles[aIdx]
//   if (!article) return
//   const section = article.sections[sIdx]
//   if (!section) return
//   const subsection = section.subsections[subIdx]
//   if (!subsection) return
//   subsection.linkPickerOpen = true
// }

function confirmAddArticleLinks(aIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  article.links.push(
    ...((article.linkDocSel || []) as Option[]).map((opt) => ({ content: `document:${opt.id}`, toEntityType: 'document' as const }))
  )
  article.links.push(
    ...((article.linkArtSel || []) as Option[]).map((opt) => ({ content: `blog:${opt.id}`, toEntityId: Number(opt.id), toEntityType: 'blog' as const }))
  )
  article.linkDocSel = []
  article.linkArtSel = []
  article.linkPickerOpen = false
}

function confirmAddSectionLinks(aIdx: number, sIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  const section = article.sections[sIdx]
  if (!section) return
  section.links.push(
    ...((section.linkDocSel || []) as Option[]).map((opt) => ({ content: `document:${opt.id}`, toEntityType: 'document' as const }))
  )
  section.links.push(
    ...((section.linkArtSel || []) as Option[]).map((opt) => ({ content: `blog:${opt.id}`, toEntityId: Number(opt.id), toEntityType: 'blog' as const }))
  )
  section.linkDocSel = []
  section.linkArtSel = []
  section.linkPickerOpen = false
}

function confirmAddSubSectionLinks(aIdx: number, sIdx: number, subIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  const section = article.sections[sIdx]
  if (!section) return
  const subsection = section.subsections[subIdx]
  if (!subsection) return
  subsection.links.push(
    ...((subsection.linkDocSel || []) as Option[]).map((opt) => ({ content: `document:${opt.id}`, toEntityType: 'document' as const }))
  )
  subsection.links.push(
    ...((subsection.linkArtSel || []) as Option[]).map((opt) => ({ content: `blog:${opt.id}`, toEntityId: Number(opt.id), toEntityType: 'blog' as const }))
  )
  subsection.linkDocSel = []
  subsection.linkArtSel = []
  subsection.linkPickerOpen = false
}

function removeSubsection(aIdx: number, sIdx: number, subIdx: number) {
  const article = documentForm.value.articles[aIdx]
  if (!article) return
  const section = article.sections[sIdx] 
  if (!section) return
  section.subsections.splice(subIdx, 1)
}

function buildPayload() {
  return {
    title: documentForm.value.title,
    summary: documentForm.value.summary || '',
    content: documentForm.value.content || '',
    status: 'DRAFT',
    isPublic: documentForm.value.isPublic,
    metaIds: documentForm.value.metaIds,
    toReferences: documentForm.value.links,
    sections: documentForm.value.articles.map((article) => ({
      title: article.title,
      content: article.content,
      status: 'DRAFT',
      isPublic: article.isPublic,
      version: '1.0',
      metaIds: article.metaIds,
      toReferences: article.links,
      children: article.sections.map((section) => ({
        title: section.title,
        content: section.content,
        status: 'DRAFT',
        isPublic: section.isPublic,
        version: '1.0',
        metaIds: section.metaIds,
        toReferences: section.links,
        children: section.subsections.map((sub) => ({
          title: sub.title,
          content: sub.content,
          status: 'DRAFT',
          isPublic: sub.isPublic,
          version: '1.0',
          metaIds: sub.metaIds,
          toReferences: sub.links,
        })),
      })),
    })),
  }
}

async function saveDocument() {
  if (!user.value) return
  isSaving.value = true
  try {
    // get all tags from document form, articles, sections, subsections
    const allTags = [...documentForm.value.tags, ...documentForm.value.articles.flatMap(a => a.tags), ...documentForm.value.articles.flatMap(a => a.sections.flatMap(s => s.tags)), ...documentForm.value.articles.flatMap(a => a.sections.flatMap(s => s.subsections.flatMap(sub => sub.tags)))]

    type CreateMetasPayload = { metas: Array<{ name: string; type: 'tag' | 'category' }> }
    const metasPayload: CreateMetasPayload = {
      metas: allTags.map(t => ({ name: t, type: 'tag' })),
    }
    const meta = await metaStore.createMeta(metasPayload as unknown as CreateMetasPayload)
    console.log('meta', meta)
    const metaNameIdMap = meta.results.reduce((acc, curr) => {
      acc[curr.name] = curr.id as unknown as number
      return acc
    }, {} as Record<string, number>)

    console.log('metaNameIdMap', metaNameIdMap)

    // for all document, articles, sections, subsections, replace the tag names with the ids
    documentForm.value.metaIds = documentForm.value.tags.map(t => metaNameIdMap[t])
    documentForm.value.articles.forEach(a => {
      a.metaIds = a.tags.map(t => metaNameIdMap[t])
      a.sections.forEach(s => {
        s.metaIds = s.tags.map(t => metaNameIdMap[t])
        s.subsections.forEach(sub => {
          sub.metaIds = sub.tags.map(t => metaNameIdMap[t])
        })
      })
    })

  //   {
  //     "results": [
  //         {
  //             "id": 4,
  //             "name": "dfdfsfd",
  //             "description": null,
  //             "slug": "dfdfsfd",
  //             "type": "tag",
  //             "createdAt": "2025-08-12T08:28:22.487Z",
  //             "updatedAt": "2025-08-12T08:28:22.487Z",
  //             "deletedAt": null
  //         },
  //         {
  //             "id": 5,
  //             "name": "asdfasdfds",
  //             "description": null,
  //             "slug": "asdfasdfds",
  //             "type": "tag",
  //             "createdAt": "2025-08-12T08:28:22.503Z",
  //             "updatedAt": "2025-08-12T08:28:22.503Z",
  //             "deletedAt": null
  //         }
  //     ],
  //     "summary": {
  //         "total": 2,
  //         "successful": 2,
  //         "failed": 0
  //     }
  // }

    const payload = buildPayload()
    console.log('payload', payload)
    
    await documentStore.createDocument(payload as unknown as Parameters<typeof documentStore.createDocument>[0])
    // router.push('/admin/documents')
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


