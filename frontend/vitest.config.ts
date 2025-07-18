import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
}) 