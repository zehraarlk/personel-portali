import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rootImagesPlugin } from '../vite-plugins/root-images.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss(), rootImagesPlugin(projectRoot, { copyOnBuild: false })],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    fs: {
      allow: [projectRoot],
    },
  },
})
