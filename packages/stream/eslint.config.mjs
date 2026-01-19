import rootConfig from "../../eslint.config.mjs";

const eslintConfig = [
  ...rootConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Stricter for type definitions
    },
  },
];

export default eslintConfig;
