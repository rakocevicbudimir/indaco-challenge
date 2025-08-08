<template>
  <div class="tiptap-editor">
    <div class="editor-menu-bar flex gap-2 p-2 border-b">
      <UButton
        size="xs"
        :color="editor?.isActive('bold') ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleBold().run()"
        :disabled="!editor?.can().chain().focus().toggleBold().run()"
      >
        Bold
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('italic') ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleItalic().run()"
        :disabled="!editor?.can().chain().focus().toggleItalic().run()"
      >
        Italic
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('strike') ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleStrike().run()"
        :disabled="!editor?.can().chain().focus().toggleStrike().run()"
      >
        Strike
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('heading', { level: 1 }) ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :disabled="!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :disabled="!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('bulletList') ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :disabled="!editor?.can().chain().focus().toggleBulletList().run()"
      >
        Bullet List
      </UButton>
      <UButton
        size="xs"
        :color="editor?.isActive('orderedList') ? 'primary' : 'gray'"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :disabled="!editor?.can().chain().focus().toggleOrderedList().run()"
      >
        Ordered List
      </UButton>
    </div>

    <editor-content 
      :editor="editor" 
      class="prose max-w-none p-4"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 hover:text-blue-600 underline'
      }
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Write something...'
    })
  ],
  editorProps: {
    attributes: {
      class: 'min-h-[200px] focus:outline-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Update content when modelValue changes externally
watch(() => props.modelValue, (newContent) => {
  const isSame = editor.value?.getHTML() === newContent
  if (editor.value && !isSame) {
    editor.value.commands.setContent(newContent, { parseOptions: { preserveWhitespace: 'full' } })
  }
})
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
