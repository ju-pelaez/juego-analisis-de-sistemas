import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite: React y un build estático (no hay servidor propio).
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
