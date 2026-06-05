const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getRoot: () => ipcRenderer.invoke('get-root'),
  readJson: (filePath) => ipcRenderer.invoke('read-json', filePath),
  readJsonSync: (filePath) => ipcRenderer.sendSync('read-json-sync', filePath),
  writeJson: (filePath, data) => ipcRenderer.invoke('write-json', filePath, data),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  pathResolve: (...segments) => ipcRenderer.invoke('path-resolve', ...segments),
  pathDirname: (p) => ipcRenderer.invoke('path-dirname', p),
  pathBasename: (p, ext) => ipcRenderer.invoke('path-basename', p, ext),
  pathExtname: (p) => ipcRenderer.invoke('path-extname', p),
  fileUrl: (p) => ipcRenderer.invoke('file-url', p),
  capturePage: (rect) => ipcRenderer.invoke('capture-page', rect),
  showSaveDialog: (opts) => ipcRenderer.invoke('show-save-dialog', opts),
})
