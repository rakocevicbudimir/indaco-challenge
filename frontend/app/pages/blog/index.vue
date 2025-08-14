<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Legal Insights Blog</h1>
      <p class="text-lg text-gray-600">
        Expert insights, practical guides, and in-depth analysis of legal topics.
      </p>
    </div>

    <BlogList />
  </div>
</template>

<script setup lang="ts">
import BlogList from '@/components/blog/BlogList.vue'

useHead({
  title: 'Legal Insights Blog',
  meta: [
    { name: 'description', content: 'Browse expert legal articles, guides, and analyses.' }
  ]
})
</script>
