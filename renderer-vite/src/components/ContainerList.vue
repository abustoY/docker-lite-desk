<template>
  <div>
    <v-btn @click="$emit('reload')" color="primary" class="my-2" style="min-width: 100px;">再読み込み</v-btn>
    <v-card v-for="c in containers" :key="c.id" class="mb-4" variant="outlined" elevation="2">
      <v-row justify="space-between">
        <v-col cols="7" class="d-flex flex-column align-center">
          <div class="d-flex flex-column py-2" style="min-width: 300px;">
            <span class="text-h6 font-weight-bold">{{ c.name }}</span>
            <div>ID: {{ c.id }}</div>
            <div>イメージ: {{ c.image }}</div>
          </div>
        </v-col>
        <v-col cols="5" class="d-flex flex-column align-center justify-center">
          <div>
            <v-chip small color="primary" class="mb-2 d-flex align-center">{{ c.status }}</v-chip>
          </div>
          <div class="d-flex flex-row justify-center mt-2">
            <v-btn v-if="c.status.includes('Exited')" color="green" class="mx-1"
                   style="min-width: 100px;" @click="$emit('action', 'start', c.id)">Start</v-btn>
            <v-btn v-if="c.status.includes('Up')" color="red" class="mx-1"
                   style="min-width: 100px;" @click="$emit('action', 'stop', c.id)">Stop</v-btn>
            <v-btn :disabled="c.status.includes('Up')" color="grey-darken-1" class="mx-1"
                   style="min-width: 100px;" @click="$emit('action', 'rm', c.id)">Remove</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  containers: Array<any>
}>();
</script>