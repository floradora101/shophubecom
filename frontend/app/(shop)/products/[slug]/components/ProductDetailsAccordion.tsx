// Modern Professional Product Details Accordion - Trendy & Unique Design
"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="group relative overflow-hidden">
      {/* Subtle gradient background */}
      <div
        className={`absolute inset-0 bg-linear-to-r from-transparent via-slate-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Main content */}
      <div className="relative border border-slate-200/60 rounded-lg sm:rounded-xl mb-2 sm:mb-3 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-md active:scale-[0.99] sm:active:scale-100">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full justify-between p-4 sm:p-6 text-left hover:bg-transparent transition-all duration-200 rounded-none h-auto min-h-[60px] sm:min-h-[72px]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Icon with animated background */}
            <div
              className={`relative p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                isOpen
                  ? "bg-primary-100 text-primary-600 shadow-sm"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {icon}
              </div>
              {/* Animated dot indicator */}
              <div
                className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  isOpen ? "bg-primary-500 scale-100" : "bg-slate-400 scale-0"
                }`}
              />
            </div>

            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              <span className="text-sm sm:text-base font-semibold text-gray-900 tracking-wide block truncate">
                {title}
              </span>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Section {index + 1}
              </div>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-all duration-300 shrink-0 ${
              isOpen
                ? "rotate-180 text-primary-500"
                : "group-hover:text-slate-600"
            }`}
          />
        </Button>

        {/* Expandable content with smooth animation */}
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-100 bg-linear-to-b from-slate-50/50 to-transparent">
            <div className="pt-3 sm:pt-4">
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line prose prose-sm max-w-none">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <Stack
      spacing="xs"
      className="sm:space-y-4 mx-auto w-full max-w-[420px] sm:max-w-[520px]"
    >
      {/* Product Details Header using SectionTitle */}
      <div className="w-full sm:w-auto lg:w-full">
        <SectionTitle
          badgeText="Product Details"
          title="Learn More"
          subtitle="Detailed information and specifications"
          showHearts={false}
          className="w-full text-center sm:text-left mx-auto mb-6 sm:mb-8"
          badgeClassName="bg-slate-50 border-slate-200"
        />
      </div>

      {/* Modern accordion items */}
      <Stack spacing="xs" className="sm:space-y-3">
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
      </Stack>
    </Stack>
  );
}
