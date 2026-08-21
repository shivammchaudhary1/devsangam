import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

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

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^']],
        },
      ],

      'simple-import-sort/exports': 'error',

      'object-curly-newline': [
        'error',
        {
          ImportDeclaration: {
            multiline: true,
            minProperties: 9,
            consistent: true,
          },

          ExportDeclaration: {
            multiline: true,
            minProperties: 9,
            consistent: true,
          },
        },
      ],

      'max-len': [
        'error',
        {
          code: 110,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: false,
          ignorePattern: '^import\\s',
        },
      ],
    },
  },
]);
