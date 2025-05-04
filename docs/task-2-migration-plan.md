# Task 2: Migrate to FS API in Renderer

## Overview
This document tracks the migration of file system operations in the renderer process to use the new FS API implemented in task 1.

## Current Implementation
The renderer currently uses `@electron/remote` to directly access `fs-extra` functionality. This is not secure as it gives the renderer process direct access to the file system.

## Migration Plan

### 1. Create FS Service in Renderer
Create a new service that will handle all file system operations through IPC calls to the main process.

### 2. Replace Direct FS Usage
The following components need to be updated to use the new FS service:

- [x] `src/renderer/services/fs.ts` - Replace direct fs-extra usage
- [x] `src/renderer/services/file-writer.ts` - Update to use new FS API
- [x] `src/renderer/services/texture-loader.ts` - Update to use new FS API
- [x] `src/renderer/services/map-loader.ts` - Update to use new FS API
- [x] `src/renderer/views/header.tsx` - Update map list reading
- [x] `src/renderer/views/editor.tsx` - Update notation saving/loading
- [x] `src/renderer/views/footer.tsx` - Update screenshot saving

### 3. Implementation Details

#### New FS Service
The new FS service provides the following methods:
- `readJson(path: string): Promise<any>`
- `writeJson(path: string, data: any): Promise<void>`
- `readImage(path: string): Promise<Buffer>`
- `enumerate(pattern: string): Promise<string[]>`

#### Migration Steps
1. [x] Create new FS service
2. [x] Update each component to use the new service
3. [x] Remove direct fs-extra usage
4. [ ] Test all file operations
5. [ ] Remove @electron/remote dependency

## Progress Tracking
- [x] Create new FS service
- [x] Migrate file-writer.ts
- [x] Migrate texture-loader.ts
- [x] Migrate map-loader.ts
- [x] Migrate header.tsx
- [x] Migrate editor.tsx
- [x] Migrate footer.tsx
- [ ] Remove @electron/remote dependency
- [ ] Test all file operations

## Known Issues
1. There are some TypeScript errors related to styled-components that need to be fixed
2. The screenshot saving functionality in footer.tsx needs to be updated to handle binary data correctly
3. The types.ts file needs to be included in the tsconfig.web.json configuration

## Next Steps
1. Fix TypeScript errors in components
2. Update screenshot saving to handle binary data
3. Add types.ts to tsconfig.web.json
4. Test all file operations
5. Remove @electron/remote dependency
