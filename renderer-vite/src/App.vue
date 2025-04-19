<template>
  <v-app>
            <v-main class="pa-4">
                <v-container>
                    <v-tabs v-model="tab" grow bg-color="grey-lighten-4">
                        <v-tab value="containers">コンテナ一覧</v-tab>
                        <v-tab value="images">イメージ一覧</v-tab>
                    </v-tabs>
                    <!-- コンテナ一覧 -->
                    <ContainerList v-if="tab === 'containers'" :containers="containers" @reload="fetchContainers" @action="dockerAction" />

                    <!-- イメージ一覧 -->
                    <ImageList v-if="tab === 'images'" :images="images" @reload="fetchImages" @action="dockerAction" />

                    <v-divider class="my-4"></v-divider>

                    <!-- 通知 -->
                    <Notification :message="message" :error="error" />

                </v-container>

            </v-main>
        </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ContainerList from './components/ContainerList.vue';
import ImageList from './components/ImageList.vue';
import Notification from './components/Notification.vue';

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