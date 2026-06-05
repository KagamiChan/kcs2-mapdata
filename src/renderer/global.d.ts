interface ElectronAPI {
  getRoot: () => Promise<string>
  readJson: (filePath: string) => Promise<any>
  readJsonSync: (filePath: string) => any
  writeJson: (filePath: string, data: any) => Promise<void>
  writeFile: (filePath: string, data: any) => Promise<void>
  pathResolve: (...segments: string[]) => Promise<string>
  pathDirname: (p: string) => Promise<string>
  pathBasename: (p: string, ext?: string) => Promise<string>
  pathExtname: (p: string) => Promise<string>
  fileUrl: (p: string) => Promise<string>
  capturePage: (rect: {
    x: number
    y: number
    width: number
    height: number
  }) => Promise<Uint8Array | null>
  showSaveDialog: (opts: any) => Promise<any>
}

interface Window {
  electronAPI: ElectronAPI
}
