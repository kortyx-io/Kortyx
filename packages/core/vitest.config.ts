import { defineKortyxVitestConfig } from "../../vitest.shared";

export default defineKortyxVitestConfig({
  test: {
    coverage: {
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
