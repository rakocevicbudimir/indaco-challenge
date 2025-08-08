<template>
  <div class="min-h-screen bg-gray-50">
    <BlogArticle :article-id="articleId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import BlogArticle from '@/components/blog/BlogArticle.vue'

const route = useRoute()
const articleId = route.params.id as string
</script>
