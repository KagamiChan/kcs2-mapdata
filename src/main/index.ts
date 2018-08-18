import { app, BrowserWindow } from 'electron'
import path from 'path'

const isDevelopment: boolean = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      webSecurity: false,
    }
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
