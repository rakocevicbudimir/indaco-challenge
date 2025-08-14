<template>
  <div class="min-h-screen bg-gray-50">
    <BlogArticle :article-id="articleId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import BlogArticle from '@/components/blog/BlogArticle.vue'

const route = useRoute()
const articleId = route.params.id as string

const siteUrl = useRuntimeConfig().public.siteUrl as string
const canonicalUrl = computed(() => `${siteUrl}/blog/${articleId}`)

useHead({
  title: 'Blog Article',
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  meta: [
    { name: 'description', content: 'Read in-depth legal insights and analysis.' }
  ]
})
</script>
