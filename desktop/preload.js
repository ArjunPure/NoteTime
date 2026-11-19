// Gives the NoteTime page a small, safe set of desktop actions (version and updates).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('NTDesktop', {
  version: () => ipcRenderer.invoke('app:version'),
  checkForUpdate: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  openDownloads: () => ipcRenderer.invoke('update:open'),
  on: (channel, cb) => {
    if (!['update:progress', 'update:ready', 'update:error'].includes(channel)) return () => {};
    const f = (_e, data) => cb(data);
    ipcRenderer.on(channel, f);
    return () => ipcRenderer.removeListener(channel, f);
  }
});
