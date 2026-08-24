import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/components/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message:
                'src/lib is the pure layer; React belongs in components or src/hooks.',
            },
            {
              name: 'react-dom',
              message:
                'src/lib is the pure layer; React belongs in components or src/hooks.',
            },
          ],
          patterns: [
            {
              group: [
                '@/components/*',
                '@/hooks/*',
                '../components/*',
                '../hooks/*',
              ],
              message:
                'src/lib is the pure layer; React belongs in components or src/hooks.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['src/components/ui/**', 'src/data/**', '**/*.test.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
  // Debt list: entries leave when the file is split. Only the human adds a new entry.
  {
    files: ['src/lib/rules.ts', 'src/components/theme-provider.tsx'],
    rules: {
      'max-lines': 'off',
    },
  },
])
