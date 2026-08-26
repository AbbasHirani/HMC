import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // next/image performs no optimization in this project: next.config.ts
      // sets images.unoptimized, and delivery sizing/format is handled by
      // Cloudinary via the f_auto,q_auto transform in lib/img.ts. Converting
      // these <img> tags would add the component's overhead for none of its
      // benefit, so the rule's advice does not apply here.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    // ProductPDF renders with @react-pdf/renderer, whose <Image> is a PDF
    // primitive accepting only src/source — there is no alt prop to add. The
    // rule matches on the component's name, not on an actual <img>.
    files: ['src/lib/ProductPDF.tsx'],
    rules: {
      'jsx-a11y/alt-text': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
