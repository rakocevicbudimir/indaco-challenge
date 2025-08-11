<template>
  <AdminLayout>
    <NuxtPage />
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/admin/AdminLayout.vue'

definePageMeta({
  middleware: 'auth',
  // Disable the default layout (header/footer) for all admin routes
  layout: false
})
</script>