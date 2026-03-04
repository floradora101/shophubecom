import type { VariantOption } from '@prisma/client';

/**
 * Transform variant options array to Record<string, string>
 * Converts [{name: "Color", value: "Red"}] to {Color: "Red"}
 */
export function transformVariantOptions(
  options?: VariantOption[],
): Record<string, string> {
  return (
    options?.reduce<Record<string, string>>((acc, option) => {
      acc[option.name] = option.value;
      return acc;
    }, {}) ?? {}
  );
}
