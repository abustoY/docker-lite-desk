<template>
  <div>
    <v-btn @click="$emit('reload')" color="primary" class="my-2" style="min-width: 100px;">再読み込み</v-btn>
    <v-card v-for="img in images" :key="img.id" class="mb-4" variant="outlined" elevation="2">
      <v-row justify="space-between">
        <v-col cols="7" class="d-flex flex-column align-center">
          <div class="d-flex flex-column py-2" style="min-width: 300px;">
            <v-card-title class="pa-0">{{ img.repository }}:{{ img.tag }}</v-card-title>
            <div>ID: {{ img.id }} / サイズ: <v-chip small color="secondary">{{ img.size }}</v-chip></div>
          </div>
        </v-col>
        <v-col cols="5" class="d-flex flex-column align-center justify-center">
          <v-btn color="red" class="my-2" style="min-width: 100px;" @click="$emit('action', 'rmi', img.id)">Remove</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  images: Array<any>
}>();
</script>