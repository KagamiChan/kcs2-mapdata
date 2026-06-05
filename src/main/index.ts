import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import url from 'url'

// TODO: something keep setting this to `development`, overriding outside export.
const isDevelopment: boolean = process.env.NODE_ENV !== 'production'

;(global as any).ROOT = path.resolve(__dirname, '../..')

ipcMain.handle('get-root', () => path.resolve(__dirname, '../..'))
ipcMain.handle('read-json', async (_e, filePath: string) => fs.readJson(filePath))
ipcMain.handle('read-json-sync', (_e, filePath: string) => fs.readJsonSync(filePath))
ipcMain.handle('write-json', async (_e, filePath: string, data: unknown) => {
  fs.ensureDirSync(path.dirname(filePath))
  return fs.writeJson(filePath, data)
})
ipcMain.handle('write-file', async (_e, filePath: string, data: unknown) => {
  fs.ensureDirSync(path.dirname(filePath))
  return fs.writeFileSync(filePath, data as any)
})
ipcMain.handle('path-resolve', (_e, ...segments: string[]) => path.resolve(...segments))
ipcMain.handle('path-dirname', (_e, p: string) => path.dirname(p))
ipcMain.handle('path-basename', (_e, p: string, ext?: string) => path.basename(p, ext))
ipcMain.handle('path-extname', (_e, p: string) => path.extname(p))
ipcMain.handle('file-url', (_e, p: string) => url.pathToFileURL(path.resolve(p)).href)

ipcMain.handle('capture-page', async (event, rect) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return null
  const image = await win.webContents.capturePage(rect)
  return image.toPNG()
})

ipcMain.handle('show-save-dialog', async (_e, opts) => {
  return dialog.showSaveDialog(opts)
})

let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDevelopment && rendererUrl) {
    // window.webContents.openDevTools({ mode: 'detach' })
    window.loadURL(rendererUrl)
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    // Workaround for cut/copy/paste/close keybindings not working in devtools window on OSX
    // FIXME: https://github.com/electron/electron/issues/11998
    // credits goes to https://github.com/onivim/oni/pull/2390
    if (process.platform === 'darwin') {
      window.webContents.devToolsWebContents &&
      window.webContents.devToolsWebContents.executeJavaScript(`
        window.addEventListener('keydown', function (e) {
          if (e.keyCode === 65 && e.metaKey) {
              document.execCommand('Select All');
          } else if (e.keyCode === 67 && e.metaKey) {
              document.execCommand('copy');
          } else if (e.keyCode === 86 && e.metaKey) {
              document.execCommand('paste');
          } else if (e.keyCode === 87 && e.metaKey) {
              window.close();
          } else if (e.keyCode === 88 && e.metaKey) {
              document.execCommand('cut');
          }
        });`)
    }
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

// on macOS it is common to re-create a window even after all windows have been closed
app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
