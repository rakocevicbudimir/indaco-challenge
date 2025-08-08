import { defineStore } from 'pinia'
import type { BlogArticle, Tag, ApiResponse } from '~/app/types/rules'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [] as BlogArticle[],
    tags: [] as Tag[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getArticleById: (state) => (id: string) =>
      state.articles.find(article => article.id === id),

    getTagById: (state) => (id: string) =>
      state.tags.find(tag => tag.id === id),

    getPublicArticles: (state) =>
      state.articles.filter(article => !article.isPremium),

    getPremiumArticles: (state) =>
      state.articles.filter(article => article.isPremium),

    getRelatedArticles: (state) => (articleId: string) => {
      const article = state.articles.find(a => a.id === articleId)
      if (!article) return []

      return state.articles
        .filter(a => 
          a.id !== articleId && // Exclude current article
          a.tags.some(tag => article.tags.includes(tag))
        )
        .slice(0, 3) // Limit to 3 related articles
    },
  },

  actions: {
    async fetchArticles() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/blog/articles')
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch articles')
        }
        
        this.articles = data.data as BlogArticle[]
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
        const response = await fetch('/api/blog/tags')
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

    async createArticle(article: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/blog/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(article),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create article')
        }
        
        const newArticle = data.data as BlogArticle
        this.articles.push(newArticle)
        
        return newArticle
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateArticle(id: string, updates: Partial<BlogArticle>) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update article')
        }
        
        const updatedArticle = data.data as BlogArticle
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

    async deleteArticle(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: 'DELETE',
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
