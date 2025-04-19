const { createApp, ref, watch } = Vue;
const vuetify = Vuetify.createVuetify();

createApp({
  setup() {
    const tab = ref('containers');
    const containers = ref([]);
    const images = ref([]);
    const message = ref('');
    const error = ref('');

    const fetchContainers = async () => {
      try {
        error.value = '';
        containers.value = await window.api.getAllContainers();
      } catch (e) {
        error.value = e.message || '取得に失敗しました';
      }
    };

    const fetchImages = async () => {
      try {
        error.value = '';
        images.value = await window.api.getAllImages();
      } catch (e) {
        error.value = e.message || '取得に失敗しました';
      }
    };

    const dockerAction = async (action, id) => {
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

    return {
      tab,
      containers,
      images,
      message,
      error,
      fetchContainers,
      fetchImages,
      dockerAction
    };
  }
}).use(vuetify).mount('#app');