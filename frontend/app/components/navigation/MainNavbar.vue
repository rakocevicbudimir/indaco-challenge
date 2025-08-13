<template>
  <header class="bg-[#1a1a1a] text-white border-b border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Left: Logo -->
      <div class="flex items-center">
        <NuxtLink to="/" class="text-xl font-semibold">
          Legal Docs
        </NuxtLink>
      </div>

      <!-- Center: Primary navigation -->
      <div class="hidden md:flex items-center gap-6 text-white">
        <UButton
          to="/documents"
          variant="ghost"
          color="white"
          :active="route.path.startsWith('/documents')"
        >
          Documents
        </UButton>
        
        <UButton
          to="/blog"
          variant="ghost"
          color="white"
          :active="route.path.startsWith('/blog')"
        >
          Blog
        </UButton>
      </div>

      <!-- Right: Auth controls -->
      <div class="hidden md:flex items-center gap-4 text-white">
        <template v-if="isAuthenticated">
          <UDropdownMenu
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
            :ui="{ width: 'w-48' }"
          >
            <UButton
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              color="white"
            >
              {{ userName }}
            </UButton>
          </UDropdownMenu>
        </template>

        <template v-else>
          <UButton
            to="/auth/login"
            variant="ghost"
            color="primary"
          >
            Log In
          </UButton>
          
          <!-- <UButton
            to="/auth/register"
            color="white"
          >
            Sign Up
          </UButton> -->
        </template>
      </div>

      <!-- Mobile menu button -->
      <UButton
        class="md:hidden"
        variant="ghost"
        color="white"
        icon="i-heroicons-bars-3"
        @click="isMenuOpen = !isMenuOpen"
      />
    </div>
  </header>

  <!-- Mobile menu -->
  <UModal
    v-model:open="isMenuOpen"
    prevent-close
    :ui="{
      modal: 'mt-16 rounded-none',
      overlay: { background: 'bg-transparent' }
    }"
  >
    <template #content>
      
      <UCard class="w-full">
        <div class="flex flex-col gap-4">
          <UButton
            to="/documents"
            variant="ghost"
            block
            :active="route.path.startsWith('/documents')"
            @click="isMenuOpen = false"
          >
            Documents
          </UButton>
          
          <UButton
            to="/blog"
            variant="ghost"
            block
            :active="route.path.startsWith('/blog')"
            @click="isMenuOpen = false"
          >
            Blog
          </UButton>
  
          <UDivider />
  
          <template v-if="isAuthenticated">
            <UButton
              to="/auth/profile"
              variant="ghost"
              block
              @click="isMenuOpen = false"
            >
              Profile Settings
            </UButton>
  
            <template v-if="isAdmin">
              <UButton
                to="/admin"
                variant="ghost"
                block
                @click="isMenuOpen = false"
              >
                Admin Panel
              </UButton>
            </template>
  
            <UButton
              color="red"
              variant="soft"
              block
              @click="handleLogoutMobile"
            >
              Log Out
            </UButton>
          </template>
  
          <template v-else>
            <UButton
              to="/auth/login"
              variant="ghost"
              block
              @click="isMenuOpen = false"
            >
              Log In
            </UButton>
            
            <UButton
              to="/auth/register"
              color="primary"
              block
              @click="isMenuOpen = false"
            >
              Sign Up
            </UButton>
          </template>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

type UserMenuItem = {
  label: string
  icon: string
  to?: string
  click?: () => void
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore)

onMounted(() => {
  authStore.checkAuth()
})

const isMenuOpen = ref(false)
const userName = computed(() => user.value?.name || '')

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}

const handleLogoutMobile = async () => {
  await handleLogout()
  isMenuOpen.value = false
}

const userMenuItems = computed<UserMenuItem[]>(() => {
  const items: UserMenuItem[] = [
    {
      label: 'Profile Settings',
      icon: 'i-heroicons-user-circle',
      to: '/auth/profile'
    }
  ]

  if (isAdmin.value) {
    items.push({
      label: 'Admin Panel',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin'
    })
  }

  items.push({
    label: 'Log Out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: handleLogout
  })

  return items
})
</script>

