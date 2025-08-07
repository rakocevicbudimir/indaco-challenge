<template>
  <div class="tiptap-editor">
    <Editor :content="modelValue" @update:content="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import 'vue-novel/style.css'
import { Editor } from 'vue-novel'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

</script>

<style>
.tiptap-editor {
  @apply border overflow-hidden;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
