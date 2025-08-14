<template>
  <div class="min-h-screen">
    <DocumentDetail :document-id="documentId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DocumentDetail from '@/components/documents/DocumentDetail.vue'

const route = useRoute()
const documentId = route.params.id as string

const siteUrl = useRuntimeConfig().public.siteUrl as string
const canonicalUrl = computed(() => `${siteUrl}/documents/${documentId}`)

useHead({
  title: 'Document Detail',
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  meta: [
    { name: 'description', content: 'View document content and related references.' }
  ]
})
</script>
