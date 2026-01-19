import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', '**/*.config.ts'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  server: {
    https: fs.existsSync(resolve(__dirname, 'certs/localhost-key.pem'))
      ? {
          key: fs.readFileSync(resolve(__dirname, 'certs/localhost-key.pem')),
          cert: fs.readFileSync(resolve(__dirname, 'certs/localhost.pem')),
        }
      : undefined,
    port: 5173,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FrontendShell',
      fileName: 'frontend-shell',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          '@tanstack/react-query': 'ReactQuery',
        },
      },
    },
  },
})
