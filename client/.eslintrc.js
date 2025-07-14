module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser', // Используйте babel-eslint для парсинга
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Ваши правила ESLint
    'vue/multi-word-component-names': 'off',
  },
};
