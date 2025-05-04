import { app, BrowserWindow } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'node:path'

const isDevelopment: boolean = process.env.NODE_ENV !== 'production'

global.ROOT = path.resolve(__dirname, '../../')

let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, '../preload/index.js'),
      webSecurity: false,
    },
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
