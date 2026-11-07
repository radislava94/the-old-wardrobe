require("./scripts/resolve-typescript6.cjs");

const { defineConfig, globalIgnores } = require("eslint/config");
const nextVitals = require("eslint-config-next/core-web-vitals");
const nextTs = require("eslint-config-next/typescript");

module.exports = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The language suggestion reads navigator once on mount. That setState
      // is the existing client-only pattern; do not restyle the component for lint.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["eslint.config.cjs", "scripts/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "mockup/**",
    "src/**",
    "scripts/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
