module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parser: '@babel/parser',
  env: {
    browser: true,
    node: true,
    es6: true,
  },
};
