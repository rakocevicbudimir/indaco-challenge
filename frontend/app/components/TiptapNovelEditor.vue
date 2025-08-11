<template>
  <div class="tiptap-editor">
    <Editor
      ref="editor"
      :default-value="content"
      :debounce-duration="2000"
      :storage-key="`novel-vue-${1}`"
      @debounced-update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - novel-vue is not typed
import { Editor } from 'novel-vue'
import type { Editor as EditorType } from '@tiptap/core'


import 'novel-vue/dist/style.css'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
console.log('props', props.modelValue)

const editor = ref<EditorType | null>(null)

const content = computed(() => {
  return JSON.parse("{}");
});

const handleUpdate = (e: EditorType) => {
  const content = e.getHTML()
  emit('update:modelValue', content)
}

</script>

<style scoped>
.tiptap-editor {
  @apply overflow-hidden;

  color: #000;
  border: none;

  font-size: 1rem;
}

.ProseMirror {
  color: #000;
  a {
    /* color: #000; */
  }
  h1, h2, h3, h4, h5, h6 {
    color: #000;
  }
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
  height: 0;
}
</style>
