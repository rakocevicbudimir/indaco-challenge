import { defineStore } from 'pinia'
import type { LegalDocument, Tag, ApiResponse } from '~/app/types/rules'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as LegalDocument[],
    tags: [] as Tag[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getDocumentById: (state) => (id: string) => 
      state.documents.find(doc => doc.id === id),
    
    getTagById: (state) => (id: string) =>
      state.tags.find(tag => tag.id === id),
    
    getCategoryTags: (state) =>
      state.tags.filter(tag => tag.type === 'category'),
    
    getRegularTags: (state) =>
      state.tags.filter(tag => tag.type === 'tag'),
  },

  actions: {
    async fetchDocuments() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/documents')
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch documents')
        }
        
        this.documents = data.data as LegalDocument[]
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async fetchTags() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/tags')
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch tags')
        }
        
        this.tags = data.data as Tag[]
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async createDocument(document: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(document),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create document')
        }
        
        const newDocument = data.data as LegalDocument
        this.documents.push(newDocument)
        
        return newDocument
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateDocument(id: string, updates: Partial<LegalDocument>) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update document')
        }
        
        const updatedDocument = data.data as LegalDocument
        const index = this.documents.findIndex(doc => doc.id === id)
        
        if (index !== -1) {
          this.documents[index] = updatedDocument
        }
        
        return updatedDocument
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteDocument(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete document')
        }
        
        this.documents = this.documents.filter(doc => doc.id !== id)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
