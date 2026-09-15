import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the same build works locally and under the
// /sofia-neighborhood-map/ subpath on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
})
