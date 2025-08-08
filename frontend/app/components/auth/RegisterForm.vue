<template>
  <UCard class="max-w-md mx-auto p-6">
    <template #header>
      <h2 class="text-2xl font-semibold text-center">Create Account</h2>
    </template>

    <form class="space-y-6" @submit.prevent="handleSubmit">
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

      <UFormGroup label="Password">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          :disabled="loading"
          required
        />
        <template #help>
          <p class="text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </template>
      </UFormGroup>

      <UFormGroup label="Confirm Password">
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          :disabled="loading"
          required
        />
      </UFormGroup>

      <UAlert
        v-if="error"
        type="danger"
        :title="error"
        class="mb-4"
      />

      <UButton
        type="submit"
        color="primary"
        block
        :loading="loading"
        :disabled="loading || !isValid"
      >
        {{ loading ? 'Creating account...' : 'Create Account' }}
      </UButton>
    </form>

    <template #footer>
      <div class="text-center">
        <NuxtLink to="/auth/login" class="text-primary-600 hover:underline">
          Already have an account? Log in
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isValid = computed(() => {
  return (
    form.value.name.length >= 2 &&
    form.value.email.includes('@') &&
    form.value.password.length >= 8 &&
    form.value.password === form.value.confirmPassword
  )
})

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    })
    router.push('/')
  } catch {
    // Error is handled by the store
  }
}
</script>


