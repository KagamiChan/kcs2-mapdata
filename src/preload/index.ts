import { contextBridge, ipcRenderer } from 'electron'
import remote from '@electron/remote'

window.ROOT = remote.getGlobal('ROOT')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('fs', {
  enumerate: (pattern: string) => ipcRenderer.invoke('fs:enumerate', pattern),
  readJson: (filePath: string) => ipcRenderer.invoke('fs:readJson', filePath),
  readImage: (filePath: string) => ipcRenderer.invoke('fs:readImage', filePath),
  writeJson: (filePath: string, data: any) => ipcRenderer.invoke('fs:writeJson', filePath, data)
})
