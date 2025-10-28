import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // The codebase intentionally uses some places with `any` for flexibility during iteration
      // and migration; disable this rule to avoid blocking production builds.
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unescaped entities in JSX (e.g. apostrophes) as the templates are controlled
      // and escaping everywhere would be noisy for authors.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
