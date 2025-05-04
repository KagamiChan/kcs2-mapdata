import { ipcMain } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'

function isPathAllowed(filePath: string, rootDir: string): boolean {
  const resolvedPath = path.resolve(filePath)
  const resolvedRoot = path.resolve(rootDir)
  return resolvedPath.startsWith(resolvedRoot)
}

export function setupFsApiHandlers(rootDir: string): void {
  // Enumerate files matching a pattern
  ipcMain.handle('fs:enumerate', async (_, pattern: string) => {
    const fullPattern = path.join(rootDir, pattern)
    if (!isPathAllowed(fullPattern, rootDir)) {
      throw new Error('Access denied: Path outside allowed directory')
    }
    return new Promise<string[]>((resolve, reject) => {
      glob(fullPattern, (err, files) => {
        if (err) reject(err)
        else resolve(files.map(f => path.relative(rootDir, f)))
      })
    })
  })

  // Read JSON file
  ipcMain.handle('fs:readJson', async (_, filePath: string) => {
    const fullPath = path.join(rootDir, filePath)
    if (!isPathAllowed(fullPath, rootDir)) {
      throw new Error('Access denied: Path outside allowed directory')
    }
    return fs.readJson(fullPath)
  })

  // Read image file
  ipcMain.handle('fs:readImage', async (_, filePath: string) => {
    const fullPath = path.join(rootDir, filePath)
    if (!isPathAllowed(fullPath, rootDir)) {
      throw new Error('Access denied: Path outside allowed directory')
    }
    return fs.readFile(fullPath)
  })

  // Write JSON file
  ipcMain.handle('fs:writeJson', async (_, filePath: string, data: any) => {
    const fullPath = path.join(rootDir, filePath)
    if (!isPathAllowed(fullPath, rootDir)) {
      throw new Error('Access denied: Path outside allowed directory')
    }
    await fs.ensureDir(path.dirname(fullPath))
    return fs.writeJson(fullPath, data, { spaces: 2 })
  })
}
