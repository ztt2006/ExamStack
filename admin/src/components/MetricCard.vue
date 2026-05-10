<script setup lang="ts">
import type { Component } from 'vue'

interface MetricCardProps {
  label: string
  value: string | number
  hint?: string
  tone?: 'blue' | 'green' | 'amber' | 'rose'
  icon: Component
}

withDefaults(defineProps<MetricCardProps>(), {
  hint: '',
  tone: 'blue',
})
</script>

<template>
  <section class="metric-card" :class="`metric-card--${tone}`">
    <div class="metric-icon">
      <component :is="icon" />
    </div>
    <div class="min-w-0">
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
      <span v-if="hint">{{ hint }}</span>
    </div>
  </section>
</template>
