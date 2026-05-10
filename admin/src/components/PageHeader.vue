<script setup lang="ts">
interface PageHeaderProps {
  title: string
  description?: string
}

defineProps<PageHeaderProps>()
</script>

<template>
  <div class="page-header">
    <div>
      <p class="page-kicker">ExamStack Admin</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
