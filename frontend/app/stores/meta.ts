import { defineStore } from 'pinia'
import type { ApiResponse, Meta } from '~/types/rules'

const externalApiUrl = '/api1'

export const useMetaStore = defineStore('meta', {
  state: () => ({
    meta: [] as Meta[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getMetaById: (state) => (id: string) =>
      state.meta.find(meta => meta.id === id),
  },

  actions: {
    async fetchMeta(): Promise<Meta[]> {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${externalApiUrl}/metas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 200) {
          throw new Error('Failed to fetch meta')
        }

        this.meta = data.data as Meta[]

        return data.data as Meta[]
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },
    async createMeta(meta: { metas: Partial<Meta>[] }): Promise<{ results: Meta[], summary: { total: number, successful: number, failed: number } }> {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('auth_token')
        if (!token) throw new Error('No token found')

        const response = await fetch(`${externalApiUrl}/metas/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(meta),
        })

        const data = await response.json() as ApiResponse

        if (response.status !== 201) {
          throw new Error(data.error || 'Failed to create meta')
        }

        return data.data as { results: Meta[], summary: { total: number, successful: number, failed: number } }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})