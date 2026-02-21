import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // public/ contains a junction to images/ so /images/* resolves in dev
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: 'index.html',
    },
    // Images are copied to dist via the build script (cp -r images dist/images)
    copyPublicDir: false,
  },
})
