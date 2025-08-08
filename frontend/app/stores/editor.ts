import { defineStore } from 'pinia'

export interface EditorState {
  content: string
  isDirty: boolean
  lastSaved: Date | null
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    content: '',
    isDirty: false,
    lastSaved: null
  }),

  getters: {
    hasUnsavedChanges: (state) => state.isDirty,
    getContent: (state) => state.content,
    getLastSaved: (state) => state.lastSaved
  },

  actions: {
    updateContent(newContent: string) {
      this.content = newContent
      this.isDirty = true
    },

    markAsSaved() {
      this.isDirty = false
      this.lastSaved = new Date()
    },

    resetContent() {
      this.content = ''
      this.isDirty = false
      this.lastSaved = null
    }
  }
})
