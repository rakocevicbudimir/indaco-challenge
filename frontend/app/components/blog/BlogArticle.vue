<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="article?.coverImage" class="w-full h-[400px] overflow-hidden">
      <img 
        :src="article.coverImage" 
        :alt="article.title"
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
              v-for="tagId in article?.tags"
              :key="tagId"
              :label="getTagName(tagId)"
              variant="soft"
              class="text-sm"
            />
          </div>
        </div>
      </header>

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
              <h3 class="text-lg font-semibold">Related Legal Documents</h3>
            </template>
            <div class="space-y-4">
              <div
                v-for="docId in article?.relatedDocuments"
                :key="docId"
                class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                @click="navigateToDocument(docId)"
              >
                <h4 class="font-medium mb-2">{{ getDocumentTitle(docId) }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ getDocumentExcerpt(docId) }}
                </p>
              </div>
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
                @click="navigateToArticle(relatedArticle.id)"
              >
                <div class="grid grid-cols-4 gap-4">
                  <img
                    v-if="relatedArticle.coverImage"
                    :src="relatedArticle.coverImage"
                    :alt="relatedArticle.title"
                    class="col-span-1 aspect-square rounded-lg object-cover"
                  >
                  <div class="col-span-3">
                    <h4 class="font-medium group-hover:text-primary transition">
                      {{ relatedArticle.title }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {{ relatedArticle.excerpt }}
                    </p>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '~/stores/blog'
import { useDocumentStore } from '~/stores/document'
import { useAuthStore } from '~/stores/auth'
import type { Tag } from '@/types/rules'

const props = defineProps<{
  articleId: string
}>()

const router = useRouter()
const blogStore = useBlogStore()
const documentStore = useDocumentStore()
const authStore = useAuthStore()

const { articles, tags } = storeToRefs(blogStore)
const { documents } = storeToRefs(documentStore)
const { isAuthenticated, user } = storeToRefs(authStore)

const article = computed(() => 
  articles.value.find(a => a.id === props.articleId)
)

const authorName = computed(() => {
  if (!article.value?.author) return ''
  const author = user.value
  return author?.name || ''
})

// Basic HTML sanitization - in production, use a proper sanitizer library
const safeContent = computed(() => {
  if (!article.value?.content) return ''
  return article.value.content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
})

const relatedArticles = computed(() => {
  if (!article.value) return []
  // Get articles that share tags with the current article
  return articles.value.filter(a => 
    a.id !== article.value!.id && // Exclude current article
    a.tags.some((tag: string) => article.value!.tags.includes(tag))
  ).slice(0, 3) // Limit to 3 related articles
})

const getTagName = (tagId: string) => {
  const tag = tags.value.find((t: Tag) => t.id === tagId)
  return tag?.name || ''
}

const formatDate = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getDocumentTitle = (docId: string) => {
  const doc = documents.value.find(d => d.id === docId)
  return doc?.title || ''
}

const getDocumentExcerpt = (docId: string) => {
  const doc = documents.value.find(d => d.id === docId)
  return doc?.excerpt || ''
}

const navigateToDocument = (docId: string) => {
  router.push(`/documents/${docId}`)
}

const navigateToArticle = (articleId: string) => {
  router.push(`/blog/${articleId}`)
}

const navigateToLogin = () => {
  router.push('/auth/login')
}
</script>