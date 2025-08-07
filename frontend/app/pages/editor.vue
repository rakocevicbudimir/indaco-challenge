<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">Rich Text Editor</h1>
      <p class="text-gray-600">A powerful editor with Tiptap and Pinia integration</p>
    </div>

    <div class="mb-4 flex justify-between items-center">
      <div class="text-sm text-gray-600" v-if="editorStore.lastSaved">
        Last saved: {{ new Date(editorStore.lastSaved).toLocaleString() }}
      </div>
      <div class="flex gap-2">
        <UButton
          color="gray"
          variant="soft"
          @click="editorStore.resetContent()"
        >
          Reset
        </UButton>
        <UButton
          color="primary"
          :loading="saving"
          :disabled="!editorStore.hasUnsavedChanges"
          @click="saveContent"
        >
          Save Changes
        </UButton>
      </div>
    </div>

    <TiptapEditor
      v-model="content"
      placeholder="Start writing your content here..."
    />

    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-2">Preview</h2>
      <div 
        class="prose max-w-none p-4 border rounded-lg"
        v-html="content"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/stores/editor'

const editorStore = useEditorStore()
const content = ref(editorStore.content)
const saving = ref(false)

watch(content, (newContent) => {
  editorStore.updateContent(newContent)
})

const saveContent = async () => {
  saving.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  editorStore.markAsSaved()
  saving.value = false
}
</script>
