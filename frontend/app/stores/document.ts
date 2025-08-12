import { defineStore } from 'pinia'
import type { LegalDocument, Meta, ApiResponse } from '@/types/rules'
type PaginatedDocuments = { items: LegalDocument[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }

const externalApiUrl = '/api1'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as LegalDocument[],
    tags: [] as Meta[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getDocumentById: (state) => (id: string) => 
      state.documents.find(doc => doc.id === id),
    
    getTagById: (state) => (id: string) =>
      state.tags.find(meta => meta.id === id),
    
    getCategoryTags: (state) =>
      state.tags.filter(meta => meta.type === 'category'),
    
    getRegularTags: (state) =>
      state.tags.filter(meta => meta.type === 'tag'),
  },

  actions: {
    async fetchDocuments(page: number, limit: number, search: string | undefined, status: string | undefined, tagId: number | null) {
      this.loading = true
      this.error = null
      
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(limit))
        if (search) params.set('search', search)
        if (status) params.set('status', status)
        if (tagId) params.set('metaIds', String(tagId))
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
        const response = await fetch(`${externalApiUrl}/documents?${params.toString()}` , {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 200 || data.success === false) {
          const message = (typeof data.error === 'string' ? data.error : undefined) || 'Failed to fetch documents'
          throw new Error(message)
        }

        // Backend returns { message, data: { items, meta }, error }
        const pageData = data.data as PaginatedDocuments
        this.documents = (pageData?.items || [])
        return pageData
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async fetchDocument(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${externalApiUrl}/documents/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 200 || data.success === false) {
          const message = (typeof data.error === 'string' ? data.error : undefined) || 'Failed to fetch document'
          throw new Error(message)
        }

        return data.data as LegalDocument
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
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await fetch(`${externalApiUrl}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(document),
        })
        
        const data = await response.json() as ApiResponse
        
        if (response.status !== 201 || data.success === false) {
          const message = (typeof data.error === 'string' ? data.error : undefined) || 'Failed to create document'
          throw new Error(message)
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
        const token = localStorage.getItem('auth_token')
        if (!token) return
        const response = await fetch(`${externalApiUrl}/documents/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (response.status !== 200 || data.success === false) {
          const message = (typeof data.error === 'string' ? data.error : undefined) || 'Failed to update document'
          throw new Error(message)
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
        const token = localStorage.getItem('auth_token')
        if (!token) return
        const response = await fetch(`${externalApiUrl}/documents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (response.status !== 200 || data.success === false) {
          const message = (typeof data.error === 'string' ? data.error : undefined) || 'Failed to delete document'
          throw new Error(message)
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
