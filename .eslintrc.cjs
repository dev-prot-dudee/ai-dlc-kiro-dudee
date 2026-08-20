module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["error", { allow: ["error", "warn"] }],
    // ignoreRestSiblings รองรับ pattern การตัด field ออกด้วย rest destructuring
    // ซึ่งใช้ใน repository.update เพื่อแยก draft ออกจาก id และ createdAt
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
    ],
  },
  ignorePatterns: ["dist", "node_modules", "*.config.ts"],
};
