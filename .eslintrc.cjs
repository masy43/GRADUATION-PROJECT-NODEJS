module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  ignorePatterns: ["node_modules/", "prisma/migrations/", "uploads/"],
  overrides: [
    {
      files: ["**/*.js", "**/*.cjs"],
      extends: ["eslint:recommended", "prettier"],
      rules: {
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },
  ],
};
