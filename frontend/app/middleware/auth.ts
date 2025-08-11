export default defineNuxtRouteMiddleware(async () => {

  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  await authStore.checkAuth()
  const { isAuthenticated, loading } = storeToRefs(authStore)

  if (!isAuthenticated.value && !loading.value) {
    return navigateTo('/auth/login')
  }
})
