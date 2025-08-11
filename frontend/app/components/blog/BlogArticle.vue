<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Cover image optional: backend may not provide it -->
    <div v-if="false" class="w-full h-[400px] overflow-hidden">
      <img 
        :src="''"
        :alt="article?.title || ''"
        class="w-full h-full object-cover"
      >
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header class="mb-12">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {{ article?.title }}
        </h1>
        
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span class="font-medium">{{ authorName }}</span>
            <span>{{ formatDate(article?.createdAt) }}</span>
          </div>
          
          <div class="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <UBadge
              v-for="em in article?.entityMeta || []"
              :key="em.id"
              :label="em.meta?.name"
              variant="soft"
              class="text-sm"
            />
          </div>
        </div>
      </header>

      <!-- Premium content -->
      <!-- TODO: This will be used for the premium content -->
      <div v-if="!isAuthenticated && article?.isPremium" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <UIcon
          name="i-heroicons-lock-closed"
          class="h-12 w-12 mx-auto mb-4 text-primary"
        />
        <h2 class="text-2xl font-bold mb-2">Premium Content</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          This article is available for premium members only.
        </p>
        <UButton
          icon="i-heroicons-arrow-right-20-solid"
          @click="navigateToLogin"
        >
          Log In to Read
        </UButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <UCard>
            <div 
              class="prose prose-lg dark:prose-invert max-w-none"
              v-html="safeContent"
            />
          </UCard>
        </div>

        <aside class="space-y-8 lg:sticky lg:top-8">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Linked Documents and Blogs</h3>
            </template>
            <div class="space-y-2 ">
              <RouterLink
                v-for="doc in article?.fromReferences"
                :key="doc.id"
                :to="navigateToDocument(doc)"
                class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                <!-- <h4 class="font-medium mb-2">{{ doc.content }}</h4> -->
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ getDocumentTitle(doc) }}
                </p>
              </RouterLink>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">More Articles</h3>
            </template>
            <div class="space-y-4">
              <div
                v-for="relatedArticle in relatedArticles"
                :key="relatedArticle.id"
                class="group cursor-pointer"
                @click="navigateToArticle(String(relatedArticle.id))"
              >
                <div class="grid grid-cols-4 gap-4">
                  <div class="col-span-3">
                    <h4 class="font-medium group-hover:text-primary transition">
                      {{ relatedArticle.title }}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '~/stores/blog'
import { useAuthStore } from '~/stores/auth'
import type { Author, EntityMeta, FullReference } from '~/types/common'

const props = defineProps<{
  articleId: string
}>()

const router = useRouter()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const { articles } = storeToRefs(blogStore)

type FullArticle = {
  id: number
  title: string
  summary: string
  content: string
  status: string
  isPremium: boolean
  authorId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: Author
  entityMeta: EntityMeta[]
  toReferences: FullReference[]
  fromReferences: FullReference[]
}

const article = ref<FullArticle | null>(null)

onMounted(async () => {
  const res = await blogStore.fetchArticle(Number(props.articleId))
  article.value = (res || null) as FullArticle | null
  console.log(article.value?.fromReferences)
})

const { isAuthenticated } = storeToRefs(authStore)

const authorName = computed(() => {
  const a = article.value?.author
  if (!a) return ''
  return `${a.firstName || ''} ${a.lastName || ''}`.trim()
})

// Basic HTML sanitization - we can update this to use a proper sanitizer library
const safeContent = computed(() => {
  if (!article.value?.content) return ''
  return article.value.content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
})

interface ListArticle { id: number; title: string; entityMeta?: Array<{ id: number; meta: { id: number } }> }

const relatedArticles = computed<ListArticle[]>(() => {
  if (!article.value) return []
  const currentMetaIds = new Set((article.value.entityMeta || []).map((em: { meta?: { id: number } }) => em.meta?.id))
  return (articles.value as unknown as ListArticle[])
    .filter(a => a.id !== article.value!.id && (a.entityMeta || []).some((em) => currentMetaIds.has(em.meta?.id)))
    .slice(0, 3)
})

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const navigateToDocument = (doc: FullReference) => {
  if (doc.toEntityType === 'document') {
    return `/documents/${doc.toEntityId}`
  } else if (doc.toEntityType === 'blog') {
    return `/blog/${doc.toEntityId}`
  }
  return '/'
}

const navigateToArticle = (articleId: string) => {
  router.push(`/blog/${articleId}`)
}

const navigateToLogin = () => {
  router.push('/auth/login')
}

const getDocumentTitle = (doc: FullReference) => {
  if (doc.toEntityType === 'document') {
    return doc.toDocument?.title || ''
  } else if (doc.toEntityType === 'blog') {
    return doc.toBlog?.title || ''
  }
  return ''
}
</script>