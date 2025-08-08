<template>
  <div class="grid lg:grid-cols-[250px_1fr] min-h-screen">
    <UCard
      class="hidden lg:block bg-gray-900 text-white rounded-none h-screen"
      :ui="{ background: 'bg-gray-900', divide: 'divide-gray-800', ring: '', shadow: '' }"
    >
      <template #header>
        <h2 class="text-xl font-semibold px-4">Admin Panel</h2>
      </template>

      <nav class="flex flex-col gap-1">
        <UButton
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :active="route.path.includes(item.path)"
          variant="ghost"
          color="white"
          class="justify-start"
        >
          <UIcon :name="item.icon" class="mr-2" />
          {{ item.label }}
        </UButton>
      </nav>
    </UCard>

    <div class="flex flex-col min-h-screen bg-gray-50">
      <UCard
        class="rounded-none border-b"
        :ui="{ background: 'bg-white', divide: '', ring: '', shadow: '' }"
      >
        <div class="flex justify-between items-center">
          <UBreadcrumb
            :items="[
              { label: 'Admin', to: '/admin' },
              { label: currentSection }
            ]"
          />

          <div class="flex items-center gap-4">
            <span class="text-gray-600">{{ userName }}</span>
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-arrow-right-on-rectangle"
              @click="logout"
            >
              Logout
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)

const navItems = [
  {
    label: 'Documents',
    path: '/admin/documents',
    icon: 'i-heroicons-document-text'
  },
  {
    label: 'Blog Articles',
    path: '/admin/blog',
    icon: 'i-heroicons-newspaper'
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: 'i-heroicons-users'
  },
  {
    label: 'Tags',
    path: '/admin/tags',
    icon: 'i-heroicons-tag'
  }
]

const currentSection = computed(() => {
  const path = route.path
  if (path.includes('/documents')) return 'Documents'
  if (path.includes('/blog')) return 'Blog Articles'
  if (path.includes('/users')) return 'Users'
  if (path.includes('/tags')) return 'Tags'
  return ''
})

const userName = computed(() => user.value?.name || '')

const logout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

