const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  },
  {
    files: ["src/**/*.ts", "prisma/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module"
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  },
  prettierConfig
];
