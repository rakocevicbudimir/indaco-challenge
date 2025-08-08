<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search articles..."
        size="lg"
        class="max-w-xl"
      />
      
      <div class="mt-4 flex flex-wrap gap-2">
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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="article in filteredArticles"
        :key="article.id"
        class="group cursor-pointer"
        @click="navigateToArticle(article.id)"
      >
        <template #header>
          <div class="relative aspect-video overflow-hidden rounded-t-lg">
            <img
              v-if="article.coverImage"
              :src="article.coverImage"
              :alt="article.title"
              class="w-full h-full object-cover transition group-hover:scale-105"
            >
            <UBadge
              v-if="article.isPremium"
              color="primary"
              variant="solid"
              class="absolute top-2 right-2"
            >
              Premium
            </UBadge>
          </div>
        </template>

        <h2 class="text-xl font-semibold mb-2 group-hover:text-primary transition">
          {{ article.title }}
        </h2>
        
        <p class="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
          {{ article.excerpt }}
        </p>
        
        <template #footer>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{{ getAuthorName(article.author) }}</span>
              <span>{{ formatDate(article.createdAt) }}</span>
            </div>
            
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tagId in article.tags"
                :key="tagId"
                :label="getTagName(tagId)"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Empty state -->
    <div 
      v-if="filteredArticles.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-document-text"
        class="h-12 w-12 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        No articles found
      </h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Try adjusting your search or filter criteria
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '~/stores/blog'
import type { Tag } from '@/types/rules'

const router = useRouter()
const blogStore = useBlogStore()
const { articles, tags } = storeToRefs(blogStore)

const searchQuery = ref('')
const selectedTags = ref<string[]>([])

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

const getTagName = (tagId: string) => {
  const tag = tags.value.find((t: Tag) => t.id === tagId)
  return tag?.name || ''
}

const getAuthorName = (authorId: string) => {
  // This would typically come from a user store
  return 'Author Name' // Placeholder
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const navigateToArticle = (articleId: string) => {
  router.push(`/blog/${articleId}`)
}
</script>