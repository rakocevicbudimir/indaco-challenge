<template>
  <UCard class="max-w-md mx-auto p-6">
    <template #header>
      <h2 class="text-2xl font-semibold text-center">Log In</h2>
    </template>

    <UForm :schema="LoginCredentialsSchema" :state="form" class="space-y-6" @submit="handleSubmit">
      <UFormField label="Email" name="email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          class="w-full"
          :disabled="loading"
          required
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          class="w-full"
          :disabled="loading"
          required
        />
      </UFormField>

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
        :disabled="loading"
      >
        {{ loading ? 'Logging in...' : 'Log In' }}
      </UButton>
    </UForm>

    <template #footer>
      <div class="flex flex-col gap-2 text-center">
        <NuxtLink to="/auth/register" class="text-primary-600 hover:underline">
          Don't have an account? Sign up
        </NuxtLink>
        <NuxtLink to="/auth/forgot-password" class="text-primary-600 hover:underline">
          Forgot your password?
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { LoginCredentialsSchema, type LoginCredentials } from '@/types/rules'
import type { FormSubmitEvent } from '@nuxt/ui'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const form = reactive<LoginCredentials>({
  email: '',
  password: '',
})

const handleSubmit = async (event: FormSubmitEvent<LoginCredentials>) => {
  try {
    await authStore.login(event.data)
    router.push('/')
  } catch {
    // Error is handled by the store
  }
}
</script>


