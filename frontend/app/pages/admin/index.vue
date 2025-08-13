<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-6">Dashboard Overview</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <UCard>
        <template #header>
          <h3 class="text-white">Documents</h3>
        </template>

        <div class="text-4xl font-semibold mb-4">{{ documentCount }}</div>
        <div class="flex justify-between text-sm text-white">
          <span>{{ publicDocumentCount }} Public</span>
          <span>{{ privateDocumentCount }} Private</span>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-white">Blog Articles</h3>
        </template>

        <div class="text-4xl font-semibold mb-4">{{ articleCount }}</div>
        <div class="flex justify-between text-sm text-white">
          <span>{{ premiumArticleCount }} Premium</span>
          <span>{{ freeArticleCount }} Free</span>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-white">Users</h3>
        </template>

        <div class="text-4xl font-semibold mb-4">{{ userCount }}</div>
        <div class="flex justify-between text-sm text-white">
          <span>{{ adminCount }} Admins</span>
          <span>{{ regularUserCount }} Regular</span>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-white">Tags</h3>
        </template>

        <div class="text-4xl font-semibold mb-4">{{ tagCount }}</div>
        <div class="flex justify-between text-sm text-white">
          <span>{{ categoryCount }} Categories</span>
          <span>{{ regularTagCount }} Tags</span>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Recent Activity</h3>
      </template>

      <div class="space-y-4">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
        >
          <UIcon
            :name="getActivityIcon(activity.type)"
            :class="[
              'h-10 w-10 p-2 rounded-full',
              {
                'text-primary-600 bg-primary-50': activity.type === 'document',
                'text-blue-600 bg-blue-50': activity.type === 'article',
                'text-green-600 bg-green-50': activity.type === 'user'
              }
            ]"
          />
          <div class="flex-1">
            <p class="mb-1 text-black">{{ activity.description }}</p>
            <span class="text-sm text-black">{{ formatDate(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '@/stores/document'
import { useBlogStore } from '@/stores/blog'
import { useAuthStore } from '@/stores/auth'

const documentStore = useDocumentStore()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const { documents } = storeToRefs(documentStore)
const { articles } = storeToRefs(blogStore)
const { users } = storeToRefs(authStore)

// Document stats
const documentCount = computed(() => documents.value?.length)
const publicDocumentCount = computed(() => 
  documents?.value?.filter(doc => doc.isPublic).length
)
const privateDocumentCount = computed(() => 
  documents?.value?.filter(doc => !doc.isPublic).length
)

// Article stats
const articleCount = computed(() => articles.value?.length)
const premiumArticleCount = computed(() => 
  articles.value?.filter(article => article.isPremium).length
)
const freeArticleCount = computed(() => 
  articles.value?.filter(article => !article.isPremium).length
)

// User stats
const userCount = computed(() => users.value?.length)
const adminCount = computed(() => 
  users.value?.filter(user => user.roles.includes('admin')).length
)
const regularUserCount = computed(() => 
  users.value?.filter(user => user.roles.includes('user')).length
)

// Tag stats
const tagCount = computed(() => documentStore.tags?.length)
const categoryCount = computed(() => 
  documentStore.tags?.filter((tag: { type: string }) => tag.type === 'category').length
)
const regularTagCount = computed(() => 
  documentStore.tags?.filter((tag: { type: string }) => tag.type === 'tag').length
)

// Mock recent activities (in a real app, this would come from an activity log)
const recentActivities = [
  {
    id: 1,
    type: 'document',
    description: 'New document "Legal Guidelines" created',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: 2,
    type: 'article',
    description: 'Blog article "Understanding Legal Terms" updated',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    id: 3,
    type: 'user',
    description: 'New user registered: john.doe@example.com',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'document':
      return 'i-heroicons-document-text'
    case 'article':
      return 'i-heroicons-newspaper'
    case 'user':
      return 'i-heroicons-user'
    default:
      return 'i-heroicons-bell'
  }
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minutes ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>
