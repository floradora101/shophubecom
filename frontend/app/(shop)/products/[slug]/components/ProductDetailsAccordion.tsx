// Modern Professional Product Details Accordion - Trendy & Unique Design
"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
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
      <div className="relative border border-slate-200/60 rounded-xl mb-3 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-md">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full justify-between p-6 text-left hover:bg-transparent transition-all duration-200 rounded-none h-auto"
        >
          <div className="flex items-center gap-4">
            {/* Icon with animated background */}
            <div
              className={`relative p-2 rounded-lg transition-all duration-300 ${
                isOpen
                  ? "bg-primary-100 text-primary-600 shadow-sm"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}
            >
              {icon}
              {/* Animated dot indicator */}
              <div
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 ${
                  isOpen ? "bg-primary-500 scale-100" : "bg-slate-400 scale-0"
                }`}
              />
            </div>

            <div className="space-y-1">
              <span className="text-base font-semibold text-slate-900 tracking-wide">
                {title}
              </span>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Section {index + 1}
              </div>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-all duration-300 ${
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
          <div className="px-6 pb-6 border-t border-slate-100 bg-linear-to-b from-slate-50/50 to-transparent">
            <div className="pt-4">
              <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-line prose prose-sm max-w-none">
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
    <div className="space-y-2">
      {/* Product Details Header using SectionTitle */}
      <SectionTitle
        badgeText="Product Details"
        title="Learn More"
        subtitle="Detailed information and specifications"
        showHearts={false}
        className="mb-8"
        badgeClassName="bg-slate-50 border-slate-200"
      />

      {/* Modern accordion items */}
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
