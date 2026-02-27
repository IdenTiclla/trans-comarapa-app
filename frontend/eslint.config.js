import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.{js,ts,vue}'],
        rules: {
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'off', // Nuxt auto-imports
            'prefer-const': 'warn',
            'no-var': 'error',
        },
    },
])
