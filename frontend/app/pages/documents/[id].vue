<template>
  <div class="min-h-screen">
    <DocumentDetail :document-id="documentId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import DocumentDetail from '@/components/documents/DocumentDetail.vue'

const route = useRoute()
const documentId = route.params.id as string
</script>
