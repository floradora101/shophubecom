// Clean Product Details Tabs Component
"use client";

import { useState } from "react";
import { Stack } from "@/components/ui/stack";
import type { Product } from "@/features/products/types";

interface ProductDetailsTabsProps {
  product: Product;
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    {
      id: "description",
      label: "Description",
      content: product.description || "No description available.",
    },
    {
      id: "specifications",
      label: "Specifications",
      content:
        product.specs && Array.isArray(product.specs)
          ? product.specs.map((spec, index) => (
              <div key={index} className="flex gap-4 py-2">
                <span className="font-medium text-gray-900 min-w-[120px]">
                  {spec.label}:
                </span>
                <span className="text-slate-600">{spec.value}</span>
              </div>
            ))
          : "No specifications available.",
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      content: (
        <Stack spacing="md">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Shipping</h4>
            <ul className="text-slate-600 space-y-1 text-sm">
              <li>• Free standard shipping on orders over $50</li>
              <li>• Express shipping available for $10</li>
              <li>• International shipping available</li>
              <li>• Processing time: 1-2 business days</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Returns</h4>
            <ul className="text-slate-600 space-y-1 text-sm">
              <li>• 30-day return window</li>
              <li>• Items must be unused and in original packaging</li>
              <li>• Free return shipping for defective items</li>
              <li>• Refunds processed within 5-7 business days</li>
            </ul>
          </div>
        </Stack>
      ),
    },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-gray-900 bg-slate-50 border-b-2 border-gray-900"
                : "text-slate-600 hover:text-gray-900 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "block" : "hidden"}
          >
            <div className="text-gray-700 leading-relaxed">{tab.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
