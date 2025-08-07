<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">API Test Page</h1>
    
    <UButton
      @click="fetchData"
      :loading="loading"
      class="mb-4"
    >
      Fetch Hello World
    </UButton>

    <div v-if="data" class="p-4 border rounded-lg bg-gray-50 text-amber-950">
      <pre class="whitespace-pre-wrap">{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending: loading, refresh: fetchData } = await useFetch('/api/hello')
</script>
