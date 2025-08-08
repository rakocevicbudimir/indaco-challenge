import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterCredentials, ApiResponse } from '~/app/types/rules'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    users: [] as User[], // For admin management
    token: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Login failed')
        }
        
        const { user, token } = data.data as { user: User; token: string }
        this.user = user
        this.token = token
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(credentials: RegisterCredentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Registration failed')
        }
        
        const { user, token } = data.data as { user: User; token: string }
        this.user = user
        this.token = token
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_token')
    },

    async checkAuth() {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Authentication check failed')
        }
        
        this.user = data.data as User
        this.token = token
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        this.logout()
      } finally {
        this.loading = false
      }
    },

    async updateProfile(updates: Partial<User>) {
      if (!this.user) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${this.user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update profile')
        }
        
        this.user = data.data as User
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      if (!this.user) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${this.user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete account')
        }
        
        this.logout()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Admin actions
    async fetchUsers() {
      if (!this.isAdmin) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch users')
        }
        
        this.users = data.data as User[]
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId: string, updates: Partial<User>) {
      if (!this.isAdmin) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(updates),
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update user')
        }
        
        const updatedUser = data.data as User
        const index = this.users.findIndex(u => u.id === userId)
        
        if (index !== -1) {
          this.users[index] = updatedUser
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId: string) {
      if (!this.isAdmin) return

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
        
        const data = await response.json() as ApiResponse
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete user')
        }
        
        this.users = this.users.filter(u => u.id !== userId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
