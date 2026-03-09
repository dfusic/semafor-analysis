import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcjs from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcjs()],
  base: './' // Generates relative asset links for GH Pages deployment
})
