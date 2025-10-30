import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct base for Render or Netlify
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ VERY IMPORTANT
})
