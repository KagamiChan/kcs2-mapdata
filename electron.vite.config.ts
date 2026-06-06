import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@inlet/react-pixi': resolve(__dirname, 'node_modules/@inlet/react-pixi/dist/react-pixi.module.js'),
        url: resolve(__dirname, 'node_modules/url/url.js')
      }
    },
    plugins: [react({ jsxRuntime: 'classic' })],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis'
    }
  }
})
