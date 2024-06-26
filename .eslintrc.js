module.exports = {
  parserOptions: {
      "project": "./tsconfig.json",
      "tsconfigRootDir": __dirname,
      "sourceType": "module"
  },
  rules: {
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "_",
        varsIgnorePattern: "_",
      },
    ],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "ts": "never"
      }
    ],
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "no-underscore-dangle": "off",
    "max-classes-per-file": "off",
    "no-param-reassign": "off",
    "class-methods-use-this": "off",
    "no-plusplus": "off",
  },
};
