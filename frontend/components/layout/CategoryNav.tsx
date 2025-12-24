"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";

import {
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import type { Category } from "@/features/products/types";

type CategoryNode = Category & { children: CategoryNode[] };

const navLinkClass =
  "flex h-full items-center whitespace-nowrap px-3 sm:px-4 text-sm font-normal uppercase transition-colors rounded-xl mx-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

const panelClass = "rounded-xl border border-gray-200 bg-white shadow-xl";

const panelLinkClass =
  "block rounded-md px-2 py-1 text-sm text-gray-700 transition-colors hover:text-primary-600 focus:bg-gray-50 focus:text-primary-600 focus:outline-none";

const panelTitleLinkClass =
  "inline-flex rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-gray-900 uppercase transition-colors hover:text-primary-600 focus:bg-gray-50 focus:text-primary-600 focus:outline-none";

function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();

  for (const c of categories) {
    const id = String(c.id);
    nodeMap.set(id, {
      ...c,
      id,
      parentId: c.parentId ? String(c.parentId) : null,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (nodes: CategoryNode[]): CategoryNode[] =>
    nodes
      .map((n) => ({ ...n, children: sortTree(n.children) }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return sortTree(roots);
}

function MegaMenu({ categoryTree }: { categoryTree: CategoryNode[] }) {
  const gridCols =
    categoryTree.length > 9
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <div
      role="menu"
      aria-label="Shop all categories"
      className={`${panelClass} px-6 py-8`}
    >
      <div className={`grid ${gridCols} gap-x-10 gap-y-8`}>
        {categoryTree.map((category) => (
          <div key={category.id} className="min-w-0 space-y-3">
            <h3>
              <Link
                href={`/products/category/${category.slug}`}
                className={panelTitleLinkClass}
              >
                {category.name}
              </Link>
            </h3>

            {category.children?.length ? (
              <ul className="space-y-1">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/products/category/${child.slug}`}
                      className={panelLinkClass}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dropdown that behaves EXACTLY like the mega menu:
 * - button is a `peer`
 * - panel shows on `peer-hover`
 * - panel stays open when you hover it (`hover:block`)
 */
function CategoryDropdown({ category }: { category: CategoryNode }) {
  const hasChildren = category.children?.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={`/products/category/${category.slug}`}
        className={`${navLinkClass} text-gray-900 hover:text-primary-600`}
      >
        {category.name}
      </Link>
    );
  }

  return (
    <div className="relative h-full">
      <button
        type="button"
        className={`peer ${navLinkClass} gap-1 text-gray-900 hover:text-primary-600 shrink-0`}
        aria-haspopup="menu"
      >
        {category.name}
        <ChevronDown className="h-3 w-3 transition-transform peer-hover:rotate-180" />
      </button>

      {/* same rule as mega menu: pt-2 no gap + peer-hover + hover keeps open */}
      <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 hidden peer-hover:block hover:block">
        <div className={`${panelClass} w-72 p-3`}>
          <div className="mb-2">
            <Link
              href={`/products/category/${category.slug}`}
              className={panelTitleLinkClass}
            >
              {category.name}
            </Link>
          </div>

          <div className="space-y-1">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/products/category/${child.slug}`}
                className={panelLinkClass}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryNav() {
  const categories = useMemo(
    () => mockCategories.map(mockCategoryToCategory),
    []
  );
  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-14 sm:top-16 z-40 h-12 sm:h-14 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* Desktop */}
        <div className="hidden lg:flex relative items-center justify-center gap-0.5 h-full w-full overflow-visible">
          {/* Shop All button is the peer that controls the mega panel */}
          <button
            type="button"
            className={`peer/shopall ${navLinkClass} gap-1.5 font-semibold text-primary-600 hover:text-primary-700 shrink-0`}
            aria-haspopup="menu"
          >
            Shop All
            <ChevronDown className="h-3.5 w-3.5 transition-transform peer-hover/shopall:rotate-180" />
          </button>

          {/* Other categories */}
          {categoryTree.slice(0, 8).map((root) => (
            <CategoryDropdown key={root.id} category={root} />
          ))}

          {categoryTree.length > 8 && (
            <Link
              href="/products"
              className={`${navLinkClass} text-gray-900 hover:text-primary-600 shrink-0`}
            >
              More
            </Link>
          )}

          {/* Mega menu panel:
              - centered correctly: inset-x-0 + inner max-w-6xl mx-auto
              - opens on peer hover
              - stays open while hovering the panel (hover:block)
          */}
          <div className="absolute inset-x-0 top-full z-60 pt-2 hidden peer-hover/shopall:block hover:block">
            <div className="mx-auto w-full max-w-6xl px-0">
              <MegaMenu categoryTree={categoryTree} />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex h-full items-center justify-between lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl transition-colors"
            aria-label="Toggle categories menu"
          >
            <Menu className="h-5 w-5" />
            <span>Categories</span>
          </button>

          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 bg-white shadow-lg">
              <div className="container mx-auto px-4 py-4">
                <Link
                  href="/products"
                  className="block px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop All
                </Link>

                <div className="mt-4 space-y-4">
                  {categoryTree.map((root) => (
                    <div
                      key={root.id}
                      className="border-b border-gray-100 pb-3 last:border-b-0"
                    >
                      <Link
                        href={`/products/category/${root.slug}`}
                        className="block px-4 py-2 text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {root.name}
                      </Link>

                      {root.children?.length ? (
                        <div className="ml-4 mt-2 space-y-1">
                          {root.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products/category/${child.slug}`}
                              className="block px-4 py-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
