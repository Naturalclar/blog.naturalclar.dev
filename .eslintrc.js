module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['react', '@typescript-eslint'],
  globals: {
    graphql: false,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
  },
}
