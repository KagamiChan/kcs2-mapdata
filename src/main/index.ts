import { app, BrowserWindow } from 'electron'
import path from 'path'

const isDevelopment: boolean = process.env.NODE_ENV !== 'production'

global.ROOT = path.resolve(__dirname, '../../')

let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, './preload.js'),
      webSecurity: false,
    },
  })

  if (isDevelopment) {
    window.webContents.openDevTools({ mode: 'detach' })
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadFile(path.join(__dirname, 'index.html'))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    // Workaround for cut/copy/paste/close keybindings not working in devtools window on OSX
    // FIXME: https://github.com/electron/electron/issues/11998
    // credits goes to https://github.com/onivim/oni/pull/2390
    if (process.platform === 'darwin') {
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
