<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Legal Documents</h1>
      <p class="text-lg text-gray-600">
        Browse our collection of legal documents. Use filters and search to find specific documents.
      </p>
    </div>

    <DocumentList />
  </div>
</template>

<script setup lang="ts">
import DocumentList from '@/components/documents/DocumentList.vue'
</script>
