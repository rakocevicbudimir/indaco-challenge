<template>
  <UCard class="max-w-md mx-auto p-6">
    <template #header>
      <h2 class="text-2xl font-semibold text-center">Create Account</h2>
    </template>

    <UForm :schema="RegisterCredentsialsSchema" :state="form" class="space-y-6" @submit="handleSubmit">
      <UFormField label="First Name" name="firstName">
        <UInput
          v-model="form.firstName"
          type="text"
          placeholder="Enter your first name"
          class="w-full"
          :disabled="loading"
          required
        />
      </UFormField>

      <UFormField label="Last Name" name="lastName">
        <UInput
          v-model="form.lastName"
          type="text"
          placeholder="Enter your last name"
          class="w-full"
          :disabled="loading"
          required
        />
      </UFormField>

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
        <template #help>
          <p class="text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </template>
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword">
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your password"
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
        {{ loading ? 'Creating account...' : 'Create Account' }}
      </UButton>
    </UForm>

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
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { z } from 'zod'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { RegisterCredentials } from '@/types/rules'
import type { FormSubmitEvent } from '@nuxt/ui'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)
const form = reactive<RegisterCredentials>({
  firstName: '',
  lastName: '',
  email: 'test@test.com',
  password: '12345678',
  confirmPassword: '12345678',
})

const handleSubmit = async (event: FormSubmitEvent<RegisterCredentials>) => {
  try {
    await authStore.register({
      ...event.data,
    })
    router.push('/')
  } catch {
    console.log('Error')
    // Error is handled by the store
  }
}
</script>


