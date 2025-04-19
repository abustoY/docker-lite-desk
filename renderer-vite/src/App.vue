<template>
  <v-app>
    <v-main>
      <v-container>
        <h1>Docker Lite Desk</h1>

        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-alert v-if="message" type="success" class="mb-4">{{ message }}</v-alert>

        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab value="containers">コンテナ一覧</v-tab>
          <v-tab value="images">イメージ一覧</v-tab>
        </v-tabs>

        <v-container>
          <v-list v-if="tab === 'containers'">
            <v-list-item v-for="container in containers" :key="container.id">
              <v-list-item-content>
                <v-list-item-title>{{ container.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn @click="dockerAction('start', container.id)" small>Start</v-btn>
                <v-btn @click="dockerAction('stop', container.id)" small color="warning">Stop</v-btn>
                <v-btn @click="dockerAction('remove', container.id)" small color="error">Remove</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-list v-else>
            <v-list-item v-for="image in images" :key="image.id">
              <v-list-item-content>
                <v-list-item-title>{{ image.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn @click="dockerAction('remove', image.id)" small color="error">Remove</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-container>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const tab = ref<'containers' | 'images'>('containers');
const containers = ref<any[]>([]);
const images = ref<any[]>([]);
const message = ref('');
const error = ref('');

const fetchContainers = async () => {
  try {
    error.value = '';
    containers.value = await window.api.getAllContainers();
  } catch (e: any) {
    error.value = e.message || '取得に失敗しました';
  }
};

const fetchImages = async () => {
  try {
    error.value = '';
    images.value = await window.api.getAllImages();
  } catch (e: any) {
    error.value = e.message || '取得に失敗しました';
  }
};

const dockerAction = async (action: string, id: string) => {
  const res = await window.api.dockerAction(action, id);
  message.value = res;
  setTimeout(() => (message.value = ''), 3000);

  if (tab.value === 'containers') {
    await fetchContainers();
  } else {
    await fetchImages();
  }
};

watch(tab, (newTab) => {
  if (newTab === 'containers') {
    fetchContainers();
  } else {
    fetchImages();
  }
}, { immediate: true });
</script>

<style scoped>
h1 {
  font-size: 24px;
  font-weight: bold;
}
</style>