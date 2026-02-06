import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function loadUnifiedEnv(appName: string) {
  const candidates = [
    process.env.UNIFIED_CREDENTIALS_PATH,
    path.resolve(__dirname, '../ops/unified-credentials.json'),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8')
      const parsed = JSON.parse(raw) as any
      const globalEnv = (parsed?.globalEnv ?? {}) as Record<string, unknown>
      const appEnv = (parsed?.apps?.[appName]?.env ?? {}) as Record<string, unknown>

      for (const [key, value] of Object.entries({ ...globalEnv, ...appEnv })) {
        if (typeof value !== 'string') continue
        // Never hydrate arbitrary secrets into a Vite build process.
        // Only allow client-safe env vars.
        if (!key.startsWith('VITE_')) continue
        if (process.env[key] === undefined) process.env[key] = value
      }
      return
    } catch {
      // ignore
    }
  }
}

loadUnifiedEnv('Subscription Cancellation')

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\\\/g, '/')
          if (!normalizedId.includes('/node_modules/')) return

          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/scheduler/')
          ) {
            return 'react'
          }

          if (
            normalizedId.includes('/node_modules/@mui/') ||
            normalizedId.includes('/node_modules/@emotion/') ||
            normalizedId.includes('/node_modules/@popperjs/')
          ) {
            return 'mui'
          }

          if (
            normalizedId.includes('/node_modules/@radix-ui/') ||
            normalizedId.includes('/node_modules/cmdk/') ||
            normalizedId.includes('/node_modules/vaul/') ||
            normalizedId.includes('/node_modules/sonner/')
          ) {
            return 'ui'
          }

          if (
            normalizedId.includes('/node_modules/recharts/') ||
            normalizedId.includes('/node_modules/d3-') ||
            normalizedId.includes('/node_modules/d3/')
          ) {
            return 'charts'
          }

          if (
            normalizedId.includes('/node_modules/jspdf/') ||
            normalizedId.includes('/node_modules/jspdf-autotable/')
          ) {
            return 'jspdf'
          }

          if (normalizedId.includes('/node_modules/html2canvas/')) return 'html2canvas'
          if (normalizedId.includes('/node_modules/dompurify/')) return 'dompurify'

          if (normalizedId.includes('/node_modules/@supabase/')) return 'supabase'
          if (normalizedId.includes('/node_modules/@stripe/')) return 'stripe'

          return 'vendor'
        },
      },
    },
  },
})
