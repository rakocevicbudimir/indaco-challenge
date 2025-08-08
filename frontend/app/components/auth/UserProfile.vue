<template>
  <div class="max-w-2xl mx-auto p-6">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-semibold">Profile Settings</h2>
      </template>

      <form class="space-y-6" @submit.prevent="saveProfile">
        <UFormGroup label="Full Name">
          <UInput
            v-model="form.name"
            type="text"
            placeholder="Enter your full name"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <UFormGroup label="Email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <UDivider class="my-6" />

        <UFormGroup label="Current Password">
          <UInput
            v-model="form.currentPassword"
            type="password"
            placeholder="Enter current password"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="New Password">
          <UInput
            v-model="form.newPassword"
            type="password"
            placeholder="Enter new password"
            :disabled="loading"
          />
          <template v-if="form.newPassword" #help>
            <p class="text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </template>
        </UFormGroup>

        <UFormGroup label="Confirm New Password">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm new password"
            :disabled="loading"
          />
        </UFormGroup>

        <UAlert
          v-if="error"
          type="danger"
          :title="error"
          class="mb-4"
        />

        <UAlert
          v-if="success"
          type="success"
          title="Profile updated successfully"
          class="mb-4"
        />

        <div class="flex justify-end">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading || !isValid"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard class="mt-8 bg-red-50">
      <template #header>
        <h3 class="text-xl font-semibold text-red-600">Danger Zone</h3>
      </template>

      <p class="text-gray-600 mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      <UButton
        color="red"
        variant="soft"
        :disabled="loading"
        @click="confirmDelete"
      >
        Delete Account
      </UButton>
    </UCard>

    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Delete Account</h3>
        </template>

        <p class="text-gray-600">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="deleteAccount"
            >
              Yes, Delete My Account
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user, loading, error } = storeToRefs(authStore)

const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const success = ref(false)
const showDeleteModal = ref(false)

const isValid = computed(() => {
  if (!form.value.name || !form.value.email) return false
  
  if (form.value.newPassword) {
    return (
      form.value.newPassword.length >= 8 &&
      form.value.newPassword === form.value.confirmPassword &&
      form.value.currentPassword
    )
  }
  
  return true
})

const saveProfile = async () => {
  if (!isValid.value) return
  success.value = false

  try {
    await authStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
      ...(form.value.newPassword ? {
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      } : {}),
    })
    
    // Reset password fields
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    
    success.value = true
  } catch {
    // Error is handled by the store
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteAccount = async () => {
  try {
    await authStore.deleteAccount()
    router.push('/auth/login')
  } catch {
    // Error is handled by the store
  }
}
</script>


