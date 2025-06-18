import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // <- ⬅️ penting untuk memastikan Vite lihat index.html di root
  build: {
    outDir: 'dist'
  }
});
