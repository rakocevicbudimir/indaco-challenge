<template>
  <div class="container mx-auto p-4">
    <TiptapNovelEditor v-model="content" />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/stores/editor'
import TiptapNovelEditor from '~/components/TiptapNovelEditor.vue'

const editorStore = useEditorStore()
const content = ref(editorStore.content)

watch(content, (newContent) => {
  editorStore.updateContent(newContent)
})
</script>
