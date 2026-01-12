// Premium Product Details Accordion - Matching TrustBadges Styling
"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Stack } from "@/components/ui/stack";
import type { Product } from "@/features/products/types";

interface ProductDetailsAccordionProps {
  product: Product;
}

interface AccordionItemProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  index: number;
}

function AccordionItem({
  title,
  content,
  isOpen,
  onToggle,
  icon,
  index,
}: AccordionItemProps) {
  return (
    <Card
      variant="default"
      padding="none"
      className="group relative bg-white/95 backdrop-blur-xl shadow-xl border border-white/30 hover:shadow-2xl hover:shadow-primary-500/15 transition-all duration-700 hover:-translate-y-3 overflow-hidden mb-3"
    >
      {/* Premium background gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg" />

      {/* Main content */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full justify-between p-4 sm:p-5 text-left hover:bg-transparent transition-all duration-200 rounded-none h-auto min-h-[60px] sm:min-h-[72px]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Enhanced Icon Section */}
            <div className="relative shrink-0">
              <div className="relative">
                {/* Icon glow effect */}
                <div className="absolute inset-0 bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 rounded-lg blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-700 scale-150" />

                {/* Main icon container */}
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 rounded-lg shadow-lg border border-white/50 group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 flex items-center justify-center ${
                    isOpen ? "scale-110 -rotate-3" : ""
                  }`}
                >
                  <div className="text-primary-600">{icon}</div>
                </div>

                {/* Subtle shine effect */}
                <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-sm sm:text-base font-bold text-warm-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-500 block truncate mb-0.5">
                {title}
              </span>
              <div className="text-xs text-warm-gray-600 uppercase tracking-wider font-medium group-hover:text-warm-gray-700 transition-colors duration-300">
                Section {index + 1}
              </div>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 sm:h-5 sm:w-5 text-warm-gray-400 transition-all duration-700 shrink-0 ${
              isOpen
                ? "rotate-180 text-primary-500"
                : "group-hover:text-warm-gray-600"
            }`}
          />
        </Button>

        {/* Expandable content with smooth animation */}
        <div
          className={`overflow-hidden transition-all duration-700 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-warm-gray-100 bg-linear-to-b from-warm-gray-50/50 to-transparent">
            <div className="pt-3 sm:pt-4">
              <div className="text-warm-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line prose prose-sm max-w-none">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium gradient accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-12 transition-all duration-700" />
    </Card>
  );
}

export function ProductDetailsAccordion({
  product,
}: ProductDetailsAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  // Generate content for each section based on actual mock data
  const getDescription = () => {
    return product.description || null;
  };

  const getSpecs = () => {
    const specs = product.specs || [];
    if (specs.length === 0) return null;

    return specs.map((spec) => `• ${spec.label}: ${spec.value}`).join("\n");
  };

  const sections: Array<{ id: string; title: string; content: string }> = [];

  const description = getDescription();
  if (description) {
    sections.push({
      id: "description",
      title: "DESCRIPTION",
      content: description,
    });
  }

  const specs = getSpecs();
  if (specs) {
    sections.push({
      id: "specifications",
      title: "SPECIFICATIONS",
      content: specs,
    });
  }

  // Define icons for each section type
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "description":
        return <FileText className="w-4 h-4" />;
      case "specifications":
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Product Details Header - Premium styling */}
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 border border-white/20 shadow-lg text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <FileText className="h-3 w-3 text-white" />
          <span>Product Details</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-warm-gray-900 mb-2">
          Learn More
        </h2>
        <p className="text-sm text-warm-gray-600 max-w-xs mx-auto">
          Detailed information and specifications
        </p>
      </div>

      {/* Premium accordion items */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          return (
            <AccordionItem
              key={section.id}
              title={section.title}
              content={section.content}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              icon={getSectionIcon(section.id)}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
