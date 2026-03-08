import { BadRequestException } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';

/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 *
 * @example
 * generateSlug("Hello World!") // "hello-world"
 * generateSlug("Product Name 123") // "product-name-123"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the slug already exists.
 * Used when creating categories/products to ensure uniqueness.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 *
 * @example
 * ensureUniqueSlug("electronics", ["electronics", "electronics-1"]) // "electronics-2"
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generates a unique slug by checking the database directly (O(1) instead of O(n)).
 * Uses the database unique constraint to efficiently check for existing slugs.
 *
 * @param prisma - Prisma client instance
 * @param baseSlug - The base slug to make unique
 * @param model - The Prisma model to check (e.g., 'product', 'category')
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
export async function ensureUniqueSlugInDb(
  prisma: PrismaClient,
  baseSlug: string,
  model: 'product' | 'category',
  excludeId?: string,
): Promise<string> {
  // Use type assertion to handle dynamic model access
  type ModelClient = {
    findFirst: (args: {
      where: { slug: string; id?: { not: string } };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };

  const modelClient = (model === 'product' ? prisma.product : prisma.category) as unknown as ModelClient;

  // Check if base slug exists
  const exists = await modelClient.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!exists) {
    return baseSlug;
  }

  const MAX_ATTEMPTS = 100;
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
    const slugExists = await modelClient.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!slugExists) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  throw new BadRequestException(
    'Could not generate unique slug. Please try a different name.',
  );
}
