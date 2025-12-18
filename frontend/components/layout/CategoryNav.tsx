// Navigation bar for browsing categories.
"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { useState, useMemo } from "react";
import { useCategoriesQuery } from "@/lib/queries/categories";
import type { Category } from "@/lib/types/product.types";

type CategoryNode = Category & { children: CategoryNode[] };

export function CategoryNav() {
  const { data: categories = [] } = useCategoriesQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categoryTree = useMemo<CategoryNode[]>(() => {
    if (!Array.isArray(categories)) {
      return [];
    }
    const nodeMap = new Map<string, CategoryNode>();
    categories.forEach((cat) => nodeMap.set(cat.id, { ...cat, children: [] }));
    const roots: CategoryNode[] = [];
    nodeMap.forEach((cat) => {
      if (cat.parentId && nodeMap.has(cat.parentId)) {
        nodeMap.get(cat.parentId)!.children.push(cat);
      } else {
        roots.push(cat);
      }
    });
    const sortTree = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes
        .map((n) => ({ ...n, children: sortTree(n.children) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    return sortTree(roots);
  }, [categories]);

  // Show root categories and any nested category that has children (e.g., Phones under Electronics)
  const displayCategories = useMemo(() => {
    const list: CategoryNode[] = [];
    const seen = new Set<string>();
    const addNode = (node: CategoryNode) => {
      if (!seen.has(node.id)) {
        list.push(node);
        seen.add(node.id);
      }
    };
    const visit = (node: CategoryNode) => {
      if (node.children.length > 0) {
        addNode(node);
      }
      node.children.forEach(visit);
    };

    categoryTree.forEach((root) => {
      addNode(root);
      root.children.forEach(visit);
    });

    return list;
  }, [categoryTree]);

  const renderChildLinks = (children: CategoryNode[]) => {
    if (!children?.length) return null;
    return (
      <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-xl py-2">
        {children.map((child) => (
          <div key={child.id} className="px-2">
            <Link
              href={`/products?category=${child.slug}`}
              className="block px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 rounded"
            >
              {child.name}
            </Link>
            {child.children.length ? (
              <div className="ml-3 border-l border-gray-100 pl-2">
                {child.children.map((grand) => (
                  <Link
                    key={grand.id}
                    href={`/products?category=${grand.slug}`}
                    className="block px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 rounded"
                  >
                    {grand.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <nav className="sticky top-16 z-40 h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 h-full">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-0 h-full">
          {/* All Products */}
          <div
            className="relative h-full"
            onMouseEnter={() => setOpenDropdown("all")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/products"
              className="flex h-full items-center gap-1 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600 whitespace-nowrap"
            >
              All Products
              <ChevronDown className="h-4 w-4" />
            </Link>
            {openDropdown === "all" && (
              <div className="absolute left-0 top-full w-56 z-50">
                <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-xl py-2">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  >
                    View All Products
                  </Link>
                  <div className="my-1 border-t border-gray-200"></div>
                  {displayCategories.map((root) => (
                    <div key={root.id} className="px-2 py-1">
                      <Link
                        href={`/products?category=${root.slug}`}
                        className="block px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 rounded"
                      >
                        {root.name}
                      </Link>
                      {root.children?.length ? (
                        <div className="ml-3 border-l border-gray-100 pl-2">
                          {root.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products?category=${child.slug}`}
                              className="block px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 rounded"
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
            )}
          </div>

          {/* Category Items */}
          {displayCategories.slice(0, 8).map((category) => (
            <div
              key={category.id}
              className="relative h-full"
              onMouseEnter={() => setOpenDropdown(category.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="flex h-full items-center gap-1 whitespace-nowrap px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
              >
                {category.name}
                <ChevronDown className="h-4 w-4" />
              </Link>
              {openDropdown === category.id && (
                <div className="absolute left-0 top-full w-56 z-50">
                  {renderChildLinks(category.children)}
                </div>
              )}
            </div>
          ))}

          {/* More Menu */}
          {displayCategories.length > 8 && (
            <div
              className="relative h-full"
              onMouseEnter={() => setOpenDropdown("more")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex h-full items-center gap-1 whitespace-nowrap px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600">
                More
                <ChevronDown className="h-4 w-4" />
              </button>
              {openDropdown === "more" && (
                <div className="absolute right-0 top-full w-56 z-50">
                  {renderChildLinks(displayCategories.slice(8))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex h-full items-center justify-between lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary-500"
          >
            <Menu className="h-5 w-5" />
            <span>Categories</span>
          </button>
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 bg-white shadow-lg">
              <div className="container mx-auto px-4 py-4">
                <Link
                  href="/products"
                  className="block px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:text-primary-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                {displayCategories.map((root) => (
                  <div key={root.id} className="mt-1">
                    <Link
                      href={`/products?category=${root.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:text-primary-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {root.name}
                    </Link>
                    {root.children?.length ? (
                      <div className="ml-4 border-l border-gray-100 pl-3">
                        {root.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?category=${child.slug}`}
                            className="block px-4 py-1 text-xs text-gray-600 transition-colors hover:text-primary-600"
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
          )}
        </div>
      </div>
    </nav>
  );
}
