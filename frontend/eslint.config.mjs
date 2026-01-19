import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Prevent importing from legacy lib paths - use feature-based imports instead
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/api/products",
                "@/lib/api/categories",
                "@/lib/api/orders",
                "@/lib/api/addresses",
                "@/lib/api/auth",
                "@/lib/api/cart",
                "@/lib/api/profile",
                "@/lib/api/admin-*",
                // Note: @/lib/api/client is explicitly allowed and should be the only import from @/lib/api/*
              ],
              message:
                "Use @/features/<feature>/api instead. Only @/lib/api/client is allowed from @/lib/api/*. Legacy lib/api paths are deprecated.",
            },
            {
              group: [
                "@/lib/queries/products",
                "@/lib/queries/categories",
                "@/lib/queries/orders",
                "@/lib/queries/addresses",
                "@/lib/queries/cart",
                "@/lib/queries/admin/*",
              ],
              message:
                "Use @/features/<feature>/queries instead. Legacy lib/queries paths are deprecated.",
            },
            {
              group: [
                "@/lib/types/product.types",
                "@/lib/types/admin.types",
                "@/lib/types/carousel.types",
                "@/lib/types/auth.types",
              ],
              message:
                "Use @/features/<feature>/types instead. Legacy lib/types paths are deprecated.",
            },
            {
              group: [
                "@/lib/validations/product.schemas",
                "@/lib/validations/category.schemas",
                "@/lib/validations/coupon.schemas",
                "@/lib/validations/promotion.schemas",
                "@/lib/validations/auth.schemas",
                "@/lib/validations/profile.schemas",
              ],
              message:
                "Use @/features/<feature>/schemas instead. Legacy lib/validations paths are deprecated.",
            },
            {
              group: ["@/lib/data/mock*"],
              message:
                "Use @/dev/mocks/* instead. Legacy lib/data paths are deprecated.",
            },
            {
              group: ["@/lib/hooks/use-cart", "@/lib/cart/cart-keys"],
              message:
                "Use @/features/cart/* instead. Legacy lib/cart and lib/hooks paths are deprecated.",
            },
            {
              group: [
                "@/components/auth/*",
                "@/components/cart/*",
                "@/components/profile/*",
                "@/components/admin/*",
                "@/components/forms/LoginForm",
                "@/components/forms/RegisterForm",
              ],
              message:
                "Use @/features/<feature>/components/* instead. Legacy components paths are deprecated.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
