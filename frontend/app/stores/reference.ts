import { defineStore } from 'pinia'
import type { Reference } from '@/types/common'
import type { ApiResponse } from '~/types/rules'

const externalApiUrl = '/api1'

export const useReferenceStore = defineStore('reference', {
  state: () => ({
    reference: [] as Reference[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchReference(): Promise<Reference[] | undefined> {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${externalApiUrl}/references`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 200) {
          throw new Error(data.error || 'Failed to fetch references')
        }

        this.reference = data.data as Reference[]
        return data.data as Reference[]
      } catch (error) {
        this.error = error as string
      } finally {
        this.loading = false
      }
    },
    async createReference(reference: { references: Reference[] }): Promise<Reference[] | undefined> {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('auth_token')

        const response = await fetch(`${externalApiUrl}/references/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(reference),
        })
        const data = await response.json() as ApiResponse

        if (response.status !== 201) {
          throw new Error(data.error || 'Failed to create reference')
        }

        this.reference.push(...(data.data as Reference[]))
        return data.data as Reference[]
      } catch (error) {
        this.error = error as string
      } finally {
        this.loading = false
      }
    },
  },
})
