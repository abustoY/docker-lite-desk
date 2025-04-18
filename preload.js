const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAllContainers: () => ipcRenderer.invoke('get-all-containers'),
  getAllImages: () => ipcRenderer.invoke('get-docker-images'),
  dockerAction: (action, id) => ipcRenderer.invoke('docker-action', { action, id }),
});
