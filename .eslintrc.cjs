module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  rules: {
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreIIFE: true },
    ],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': 'error',
  },
  ignorePatterns: [
    'main.js',
    'preload.js',
    'build-connectors.js',
    'install-connectors.js',
    'copy-connectors-modules.js',
    'connectorInstaller.js',
    'scripts/notarize.js',
    'connectorUninstaller.js',
    'builder-configs/**',
  ],
};
