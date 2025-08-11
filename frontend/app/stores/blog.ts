import { defineStore } from 'pinia'
import type { ApiResponse } from '@/types/rules'
import type { Meta, EntityMeta } from '@/types/common'

const externalApiUrl = '/api1'
interface StoreBlogArticle {
  id: number
  title: string
  isPremium: boolean
  entityMeta: EntityMeta[]
}

type PaginatedArticles = { items: StoreBlogArticle[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [] as StoreBlogArticle[],
    tags: [] as Meta[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getArticleById: (state) => (id: number) =>
      state.articles.find(article => article.id === id),

    getTagById: (state) => (id: number) =>
      state.tags.find(meta => meta.id === id),

    getPublicArticles: (state) =>
      state.articles.filter(article => !article.isPremium),

    getPremiumArticles: (state) =>
      state.articles.filter(article => article.isPremium),

    getRelatedArticles: (state) => (articleId: number) => {
      const article = state.articles.find(a => a.id === articleId)
      if (!article) return []

      return state.articles
        .filter(a => 
          a.id !== articleId &&
          a.entityMeta.some(em => article.entityMeta.map(aem => aem.meta.id).includes(em.meta.id))
        )
        .slice(0, 3) // Limit to 3 related articles
    },
  },

  actions: {
    async fetchArticles(page: number, limit: number, search: string | undefined, status: string | undefined, tagId: number | null) {
      this.loading = true
      this.error = null
      
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(limit))
        if (search) params.set('search', search)
        if (status) params.set('status', status)
        if (tagId) params.set('metaIds', String(tagId))

        const response = await fetch(`${externalApiUrl}/blogs?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json() as ApiResponse
        
        if (response.status !== 200) {
          throw new Error(data.error || 'Failed to fetch articles')
        }
        
        const pageData = data.data as PaginatedArticles
        this.articles = (pageData?.items || [])
        return pageData
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async fetchArticle(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
        const response = await fetch(`${externalApiUrl}/blogs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 200) {
          throw new Error(data.error || 'Failed to fetch article')
        }

        const article = data.data as StoreBlogArticle
        return article
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async createArticle(article: Partial<{ title: string; summary: string; content: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; isPremium: boolean; metaIds: number[]; coverImage?: string }>) {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${externalApiUrl}/blogs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(article),
        })
        
        const data = await response.json() as ApiResponse
        
        if (response.status !== 201) {
          throw new Error(data.error || 'Failed to create article')
        }
        
        const newArticle = data.data as StoreBlogArticle
        this.articles.push(newArticle)
        
        return newArticle
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateArticle(id: number, updates: Partial<{ title: string; summary: string; content: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; isPremium: boolean; metaIds: number[]; coverImage?: string }>) {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/blogs/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update article')
        }
        
        const updatedArticle = data.data as StoreBlogArticle
        const index = this.articles.findIndex(article => article.id === id)
        
        if (index !== -1) {
          this.articles[index] = updatedArticle
        }
        
        return updatedArticle
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteArticle(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${externalApiUrl}/blogs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete article')
        }
        
        this.articles = this.articles.filter(article => article.id !== id)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
