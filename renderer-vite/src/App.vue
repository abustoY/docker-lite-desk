<template>
  <v-app>
            <v-main class="pa-4">
                <v-container>
                    <v-tabs v-model="tab" grow bg-color="grey-lighten-4">
                        <v-tab value="containers">コンテナ一覧</v-tab>
                        <v-tab value="images">イメージ一覧</v-tab>
                    </v-tabs>
                    <!-- コンテナ一覧 -->
                    <div v-if="tab === 'containers'">
                        <v-btn @click="fetchContainers" color="primary" class="my-2"
                            style="min-width: 100px;">再読み込み</v-btn>
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
                                        <v-chip small color="primary" class="mb-2 d-flex align-center">{{ c.status
                                            }}</v-chip>
                                    </div>
                                    <div class="d-flex flex-row justify-center mt-2">
                                        <v-btn v-if="c.status.includes('Exited')" color="green" class="mx-1"
                                            style="min-width: 100px;" @click="dockerAction('start', c.id)">Start</v-btn>
                                        <v-btn v-if="c.status.includes('Up')" color="red" class="mx-1"
                                            style="min-width: 100px;" @click="dockerAction('stop', c.id)">Stop</v-btn>
                                        <v-btn :disabled="c.status.includes('Up')" color="grey-darken-1" class="mx-1"
                                            style="min-width: 100px;" @click="dockerAction('rm', c.id)">Remove</v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>

                    <!-- イメージ一覧 -->
                    <div v-if="tab === 'images'">
                        <v-btn @click="fetchImages" color="primary" class="my-2" style="min-width: 100px;">再読み込み</v-btn>
                        <v-card v-for="img in images" :key="img.id" class="mb-4" variant="outlined" elevation="2">
                            <v-row justify="space-between">
                                <v-col cols="7" class="d-flex flex-column align-center">
                                    <div class="d-flex flex-column py-2" style="min-width: 300px;">

                                        <v-card-title class="pa-0"> {{ img.repository }}:{{ img.tag }}</v-card-title>
                                        <div>ID: {{ img.id }} / サイズ: <v-chip small color="secondary">{{ img.size
                                                }}</v-chip></div>
                                    </div>
                                </v-col>
                                <v-col cols="5" class="d-flex flex-column align-center justify-center">
                                    <!-- <v-card-actions> -->
                                        <v-btn color="red" class="my-2" style="min-width: 100px;"
                                            @click="dockerAction('rmi', img.id)">Remove</v-btn>
                                    <!-- </v-card-actions> -->
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>

                    <v-divider class="my-4"></v-divider>

                    <!-- 通知 -->
                    <v-alert v-if="message" type="success" class="my-4">{{ message }}</v-alert>
                    <v-alert v-if="error" type="error" class="my-4">{{ error }}</v-alert>

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

<!-- <style>
        body {
            background-color: #f5faff;
            font-family: 'Noto Sans JP', sans-serif;
        }

        v-card {
            border-radius: 12px;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        v-btn {
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background-color: #e0f7fa;
        }
    </style> -->