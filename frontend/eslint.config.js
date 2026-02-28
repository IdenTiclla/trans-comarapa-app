import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.{js,ts,vue}'],
        rules: {
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'off', // Nuxt auto-imports
            'prefer-const': 'warn',
            'no-var': 'error',
            'vue/multi-word-component-names': 'off',
        },
    },
])
