const { contextBridge, ipcRenderer } = require('electron');

if (process.env.NODE_ENV === 'test') {
  import('wdio-electron-service/preload');
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
});
