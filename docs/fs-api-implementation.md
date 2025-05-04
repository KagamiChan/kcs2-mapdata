# File System API Implementation

## Overview

This document details the implementation of a secure file system API for the Electron application. The implementation follows Electron's security best practices by:

1. Restricting file system access to a specific root directory
2. Using `contextBridge` to expose a limited set of APIs
3. Implementing path validation to prevent directory traversal
4. Using asynchronous operations for all file system interactions

## Implementation Details

### Main Process Handlers (`src/main/fs-api.ts`)

The main process implements the following file system operations:

```typescript
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
```

### Security Measures

1. **Path Validation**
   ```typescript
   function isPathAllowed(filePath: string, rootDir: string): boolean {
     const resolvedPath = path.resolve(filePath)
     const resolvedRoot = path.resolve(rootDir)
     return resolvedPath.startsWith(resolvedRoot)
   }
   ```
   - Ensures all file operations are restricted to the specified root directory
   - Prevents directory traversal attacks
   - Uses `path.resolve()` to normalize paths before comparison

2. **Context Isolation**
   - APIs are exposed through `contextBridge` in the preload script
   - Prevents direct access to Node.js APIs from the renderer process
   - Provides a controlled interface for file system operations

3. **Asynchronous Operations**
   - All file system operations are asynchronous
   - Prevents blocking the main process
   - Better error handling through Promises

### Preload Script (`src/preload/index.ts`)

The preload script exposes the file system APIs to the renderer process:

```typescript
contextBridge.exposeInMainWorld('fs', {
  enumerate: (pattern: string) => ipcRenderer.invoke('fs:enumerate', pattern),
  readJson: (filePath: string) => ipcRenderer.invoke('fs:readJson', filePath),
  readImage: (filePath: string) => ipcRenderer.invoke('fs:readImage', filePath),
  writeJson: (filePath: string, data: any) => ipcRenderer.invoke('fs:writeJson', filePath, data)
})
```

### Type Declarations (`src/types/global.d.ts`)

TypeScript declarations for the exposed APIs:

```typescript
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
```

## Usage Examples

### Enumerating Files
```typescript
const files = await window.fs.enumerate('*.json')
```

### Reading JSON
```typescript
const data = await window.fs.readJson('path/to/file.json')
```

### Reading Images
```typescript
const imageBuffer = await window.fs.readImage('path/to/image.png')
```

### Writing JSON
```typescript
await window.fs.writeJson('path/to/file.json', { some: 'data' })
```

## Benefits

1. **Security**
   - Restricted file system access
   - Path validation
   - Context isolation

2. **Type Safety**
   - TypeScript declarations for all APIs
   - Clear interface for file system operations

3. **Error Handling**
   - Consistent error handling through Promises
   - Clear error messages for security violations

4. **Maintainability**
   - Centralized file system operations
   - Clear separation of concerns
   - Easy to extend with new operations
