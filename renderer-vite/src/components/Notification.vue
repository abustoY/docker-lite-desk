<template>
    <div>
      <v-alert v-if="message" type="success" class="my-4">{{ message }}</v-alert>
      <v-alert v-if="error" type="error" class="my-4">{{ error }}</v-alert>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    message: string
    error: string
  }>();
  </script>