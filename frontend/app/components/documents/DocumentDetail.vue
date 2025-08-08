<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-12">
      <h1 class="text-4xl font-bold mb-6">{{ document?.title }}</h1>
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b">
        <div class="flex items-center gap-4 text-gray-600">
          <span>By {{ authorName }}</span>
          <span>{{ formatDate(document?.createdAt) }}</span>
        </div>
        
        <div class="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <UBadge
            v-for="tagId in document?.tags"
            :key="tagId"
            :label="getTagName(tagId)"
            variant="soft"
            class="text-sm"
          />
        </div>
      </div>
    </div>

    <UCard
      v-if="!isAuthenticated && !document?.isPublic"
      class="text-center py-12"
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
        <UCard>
          <div class="prose prose-lg max-w-none" v-html="document?.content"></div>
          
          <template v-if="document?.lines">
            <UDivider class="my-8" />
            <div class="space-y-4">
              <UCard
                v-for="line in document.lines"
                :key="line.id"
                class="bg-gray-50"
              >
                <div class="grid grid-cols-[50px_1fr] gap-4">
                  <div class="font-mono text-gray-500">{{ line.lineNumber }}</div>
                  <div>
                    <div>{{ line.content }}</div>
                    <div v-if="line.references.length" class="mt-2">
                      <span class="text-gray-600 mr-2">References:</span>
                      <UButton
                        v-for="refId in line.references"
                        :key="refId"
                        variant="link"
                        @click="navigateToReference(refId)"
                      >
                        {{ getReferenceTitle(refId) }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </template>
        </UCard>
      </div>

      <aside>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Related Blog Articles</h3>
          </template>
          <div class="space-y-4">
            <div
              v-for="article in relatedArticles"
              :key="article.id"
              class="group cursor-pointer"
              @click="navigateToArticle(article.id)"
            >
              <div class="grid grid-cols-4 gap-4">
                <img
                  v-if="article.coverImage"
                  :src="article.coverImage"
                  :alt="article.title"
                  class="col-span-1 aspect-square rounded-lg object-cover"
                >
                <div class="col-span-3">
                  <h4 class="font-medium group-hover:text-primary transition">
                    {{ article.title }}
                  </h4>
                  <p class="text-sm text-gray-600 line-clamp-2">
                    {{ article.excerpt }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '~/stores/document'
import { useBlogStore } from '~/stores/blog'
import { useAuthStore } from '~/stores/auth'
import type { BlogArticle } from '@/types/rules'

const props = defineProps<{
  documentId: string
}>()

const router = useRouter()
const documentStore = useDocumentStore()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const { documents, tags } = storeToRefs(documentStore)
const { articles } = storeToRefs(blogStore)
const { isAuthenticated, user } = storeToRefs(authStore)

const document = computed(() => 
  documents.value.find(d => d.id === props.documentId)
)

const authorName = computed(() => {
  if (!document.value?.author) return ''
  const author = user.value
  return author?.name || ''
})

const relatedArticles = computed(() => {
  if (!document.value) return []
  return articles.value.filter(article =>
    article.relatedDocuments.includes(document.value!.id)
  )
})

const getTagName = (tagId: string) => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const formatDate = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getReferenceTitle = (refId: string) => {
  const doc = documents.value.find(d => d.id === refId)
  return doc?.title || 'Unknown Reference'
}

const navigateToReference = (refId: string) => {
  router.push(`/documents/${refId}`)
}

const navigateToArticle = (articleId: string) => {
  router.push(`/blog/${articleId}`)
}

const navigateToLogin = () => {
  router.push('/auth/login')
}
</script>

