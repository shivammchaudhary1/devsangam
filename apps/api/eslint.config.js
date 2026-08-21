import js from '@eslint/js';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.ts'],

    extends: [js.configs.recommended, tseslint.configs.recommended],

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      globals: globals.node,

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

      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

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
