import { plugin as shadcn } from "@shadcn/lint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // @shadcn/lint design-system rules.
  // Docs: https://github.com/shadcn-ui/lint#rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    settings: {
      shadcn: {
        note: "Design tokens live in app/globals.css.",
      },
    },
    rules: {
      "shadcn/no-raw-colors": "error",
      "shadcn/no-unknown-classes": ["error", { allow: ["toaster"] }],
      "shadcn/require-static-classes": "error",
      "shadcn/no-restyle": ["warn", { allow: ["layout"] }],
      "shadcn/no-arbitrary-values": "warn",
      "shadcn/no-inline-styles": "warn",
    },
  },
  // Design system components own their styling.
  {
    files: ["components/ui/**", "components/ai/**", "components/voice/**"],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/no-arbitrary-values": "off",
      // Primitives forward className props and call cva variants.
      "shadcn/require-static-classes": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".next-test/**",
    "test-results/**",
    "playwright-report/**",
    "out/**",
    "build/**",
    "public/r/**",
    "next-env.d.ts",
    // React Native styles with StyleSheet, not Tailwind; it type-checks on its own (pnpm native:check).
    "native/**",
  ]),
]);

export default eslintConfig;
