import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      'firebase/auth': fileURLToPath(new URL('./src/shims/firebaseAuth.js', import.meta.url)),
      'firebase/firestore': fileURLToPath(new URL('./src/shims/firebaseFirestore.js', import.meta.url)),
    },
  },
})
