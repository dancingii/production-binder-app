import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      process: 'process/browser',
    },
  },
  define: {
    'process.env': {},
  },
});
