<template>
  <UHeader
    :ui="{
      wrapper: 'bg-white border-b',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }"
  >
    <template #left>
      <NuxtLink to="/" class="text-xl font-semibold text-primary">
        Legal Docs
      </NuxtLink>
    </template>

    <template #center>
      <div class="hidden md:flex items-center gap-6">
        <UButton
          to="/documents"
          variant="ghost"
          :active="route.path.startsWith('/documents')"
        >
          Documents
        </UButton>
        
        <UButton
          to="/blog"
          variant="ghost"
          :active="route.path.startsWith('/blog')"
        >
          Blog
        </UButton>
      </div>
    </template>

    <template #right>
      <div class="hidden md:flex items-center gap-4">
        <template v-if="isAuthenticated">
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
            :ui="{ width: 'w-48' }"
          >
            <UButton
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            >
              {{ userName }}
            </UButton>
          </UDropdown>
        </template>

        <template v-else>
          <UButton
            to="/auth/login"
            variant="ghost"
          >
            Log In
          </UButton>
          
          <UButton
            to="/auth/register"
            color="primary"
          >
            Sign Up
          </UButton>
        </template>
      </div>

      <!-- Mobile menu button -->
      <UButton
        class="md:hidden"
        variant="ghost"
        icon="i-heroicons-bars-3"
        @click="isMenuOpen = !isMenuOpen"
      />
    </template>
  </UHeader>

  <!-- Mobile menu -->
  <UModal
    v-model="isMenuOpen"
    prevent-close
    :ui="{
      modal: 'mt-16 rounded-none',
      overlay: { background: 'bg-transparent' }
    }"
  >
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
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore)

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

const userMenuItems = computed(() => {
  const items = [
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

