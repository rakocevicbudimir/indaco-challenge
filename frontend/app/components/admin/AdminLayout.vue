<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <USlideover
      v-model:open="isMobileMenuOpen"
      class="w-[280px]"
      :close="true"
      :ui="{
        wrapper: 'bg-white dark:bg-gray-800',
        overlay: 'bg-gray-950/80'
      }"
    >
      <template #content>
        <div class="flex h-full flex-col">
          <div class="flex-1 overflow-y-auto">
            <nav class="flex flex-col gap-y-5 px-6 py-4">
              <div class="flex h-16 shrink-0 items-center">
                <NuxtLink to="/" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-scale" class="h-8 w-8 text-primary" />
                  <span class="text-xl font-semibold">Legal Docs</span>
                </NuxtLink>
              </div>
  
              <ul role="list" class="flex flex-1 flex-col gap-y-2">
                <li v-for="item in navigation" :key="item.name">
                  <NuxtLink
                    :to="item.to"
                    :exact="item.exact"
                    :class="[
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold',
                      route.path === item.to || (!item.exact && route.path.startsWith(item.to))
                        ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    ]"
                  >
                    <UIcon :name="item.icon" class="h-6 w-6 shrink-0" />
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Static sidebar for desktop -->
    <div class="sm:hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-6">
        <nav class="flex flex-col gap-y-5 py-4">
          <div class="flex h-16 shrink-0 items-center">
            <NuxtLink to="/" class="flex items-center gap-2">
              <UIcon name="i-heroicons-scale" class="h-8 w-8 text-primary" />
              <span class="text-xl font-semibold">Legal Docs</span>
            </NuxtLink>
          </div>

          <ul role="list" class="flex flex-1 flex-col gap-y-2">
            <li v-for="item in navigation" :key="item.name">
              <NuxtLink
                :to="item.to"
                :exact="item.exact"
                :class="[
                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold',
                  route.path === item.to || (!item.exact && route.path.startsWith(item.to))
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <UIcon :name="item.icon" class="h-6 w-6 shrink-0" />
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-72">
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <!-- Mobile menu button -->
        <button 
          type="button" 
          class="-m-2.5 p-2.5 lg:hidden"
          @click="isMobileMenuOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
        </button>

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div class="flex flex-1 items-center gap-x-4 lg:gap-x-6">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-x-2 text-sm text-gray-500">
              <span>Admin</span>
              <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
              <span>{{ currentSection }}</span>
            </div>
          </div>

          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Theme toggle -->
            <UColorModeButton />
            
            <!-- Profile dropdown -->
            <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
              <UButton
                variant="ghost"
                class="flex items-center gap-x-2"
              >
                <UAvatar
                  :alt="userName"
                  :text="userInitials"
                  size="sm"
                />
                <span class="hidden lg:block">{{ userName }}</span>
                <UIcon name="i-heroicons-chevron-down" class="hidden lg:block h-4 w-4" />
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </div>

      <main class="py-8">
        <div class="px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

interface NavigationItem {
  name: string
  to: string
  icon: string
  exact?: boolean
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    to: '/admin',
    icon: 'i-heroicons-home',
    exact: true
  },
  {
    name: 'Documents',
    to: '/admin/documents',
    icon: 'i-heroicons-document-text'
  },
  {
    name: 'Blog Articles',
    to: '/admin/blog',
    icon: 'i-heroicons-newspaper'
  },
  {
    name: 'Users',
    to: '/admin/users',
    icon: 'i-heroicons-users'
  },
  {
    name: 'Meta',
    to: '/admin/metas',
    icon: 'i-heroicons-tag'
  }
]

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const isMobileMenuOpen = ref(false)

const currentSection = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard'
  if (path.includes('/documents')) return 'Documents'
  if (path.includes('/blog')) return 'Blog Articles'
  if (path.includes('/users')) return 'Users'
  if (path.includes('/metas')) return 'Meta'
  return ''
})

const userName = computed(() => {
  return user.value?.name || ''
})

const userInitials = computed(() => {
  const name = user.value?.name || ''
  const nameParts = name.split(' ')
  return nameParts.length > 1 
    ? `${nameParts[0]?.[0] || ''}${nameParts[1]?.[0] || ''}`
    : nameParts[0]?.[0] || ''
})

const userMenuItems = computed(() => [
  [
    {
      label: 'Your Profile',
      icon: 'i-heroicons-user-circle',
      to: '/admin/profile'
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin/settings'
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: async () => {
        await authStore.logout()
        router.push('/auth/login')
      }
    }
  ]
])
</script>