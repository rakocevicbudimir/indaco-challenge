<script setup lang="ts">
import { useCounterStore } from '~/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <h1 class="font-bold text-2xl text-(--ui-primary)">
      Pinia Counter Example
    </h1>

    <div class="flex flex-col items-center gap-4">
      <div class="text-xl">
        Count: {{ counter.count }}
      </div>
      <div class="text-lg text-gray-600">
        Double Count: {{ counter.doubleCount }}
      </div>

      <div class="flex items-center gap-2">
        <UButton
          label="Increment"
          icon="i-lucide-plus"
          @click="counter.increment()"
        />

        <UButton
          label="Decrement"
          color="red"
          @click="counter.decrement()"
        />

        <UButton
          label="Reset"
          color="gray"
          variant="outline"
          @click="counter.reset()"
        />
      </div>
    </div>
  </div>
</template>
