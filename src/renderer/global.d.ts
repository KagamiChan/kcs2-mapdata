export {}

declare global {
  interface Window {
    ROOT: string
    fs: {
      enumerate: (pattern: string) => Promise<string[]>
      readJson: (filePath: string) => Promise<any>
      readImage: (filePath: string) => Promise<Buffer>
      writeJson: (filePath: string, data: any) => Promise<void>
    }
  }
}
