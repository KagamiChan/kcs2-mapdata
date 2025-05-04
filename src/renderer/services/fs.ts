import { ipcRenderer } from 'electron'

export const fs = {
  readJson: async (path: string): Promise<any> => {
    return ipcRenderer.invoke('fs:readJson', path)
  },

  writeJson: async (path: string, data: any): Promise<void> => {
    return ipcRenderer.invoke('fs:writeJson', path, data)
  },

  readImage: async (path: string): Promise<Buffer> => {
    return ipcRenderer.invoke('fs:readImage', path)
  },

  enumerate: async (pattern: string): Promise<string[]> => {
    return ipcRenderer.invoke('fs:enumerate', pattern)
  }
}
