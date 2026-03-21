import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    preact(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'inspector.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
