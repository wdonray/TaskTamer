import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), crx({ manifest }),],
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '@': '.'
    }
  },
})
