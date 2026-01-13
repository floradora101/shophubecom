// BrandStory: Tech-focused brand story section

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { Cpu, Zap, Shield } from "lucide-react";
import Image from "next/image";
import { SectionHeader, SectionTitle } from "./shared/section-header";
import { BackgroundGradients } from "./shared/background-gradients";

const techValues = [
  {
    title: "Innovation First",
    description:
      "Curating cutting-edge technology that shapes tomorrow's solutions",
    icon: Cpu,
  },
  {
    title: "Performance Driven",
    description: "Every product tested for peak performance and reliability",
    icon: Zap,
  },
  {
    title: "Trusted Quality",
    description:
      "Rigorous quality standards ensure lasting value and satisfaction",
    icon: Shield,
  },
];

export function BrandStory() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Brand Story */}
          <div className="space-y-6 lg:space-y-8 text-center md:text-left">
            <SectionHeader
              badge={{
                icon: Zap,
                text: "Tech Excellence",
              }}
              title={{
                italic: "Empowering",
                bold: "Tomorrow's Tech",
              }}
              description="We're not just selling gadgets—we're connecting innovators with the tools that drive progress. Every device in our collection represents the perfect fusion of cutting-edge technology and practical utility."
            />

            {/* Tech Values */}
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 font-[var(--font-inter)]">
                Why Choose ShopHub Tech
              </h3>
              <div className="space-y-4 lg:space-y-6">
                {techValues.map((value) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={value.title}
                      className="flex items-start gap-4 group"
                    >
                      <div className="shrink-0 w-12 h-12 bg-linear-to-br from-primary-50 to-primary-100/50 rounded-lg flex items-center justify-center border border-primary-200/30 group-hover:shadow-lg transition-all duration-300">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-2 font-[var(--font-inter)] text-lg">
                          {value.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed font-[var(--font-inter)]">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Logo & Achievements */}
          <div className="space-y-8 lg:space-y-12 text-center lg:text-left">
            {/* Logo Section */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative group">
                {/* Background glow */}
                <div className="absolute inset-0 bg-linear-to-br from-primary-500/10 via-primary-400/5 to-primary-600/10 rounded-full blur-2xl scale-125 group-hover:scale-150 transition-transform duration-700"></div>

                {/* Logo container */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-xl border border-white/30">
                  <Image
                    src="/logo.png"
                    alt="ShopHub Logo"
                    width={120}
                    height={120}
                    className="relative object-contain drop-shadow-sm"
                  />
                </div>

                {/* Decorative elements - slower animations */}
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-primary-500 rounded-full shadow-lg shadow-primary-500/50"
                  style={{
                    animation: "pulse 3.5s ease-in-out infinite",
                  }}
                ></div>
                <div
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-400 rounded-full shadow-md shadow-primary-400/40"
                  style={{
                    animation: "pulse 4s ease-in-out infinite",
                    animationDelay: "1s",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Skeleton loader for BrandStory component
 * Shows brand story layout with stats, values, and content placeholders
 */
export function BrandStorySkeleton() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600">
              <SkeletonBlock className="w-3 h-3 rounded" />
              <SkeletonBlock className="h-3 w-24 rounded" />
            </div>

            {/* Title */}
            <div className="space-y-4">
              <SkeletonBlock className="h-12 w-96 mx-auto rounded" />
              <SkeletonBlock className="h-6 w-80 mx-auto rounded" />
            </div>

            {/* Description */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <SkeletonBlock className="h-4 w-full rounded" />
              <SkeletonBlock className="h-4 w-5/6 mx-auto rounded" />
              <SkeletonBlock className="h-4 w-4/5 mx-auto rounded" />
            </div>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Content */}
            <div className="space-y-6 lg:space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 mb-2 mx-auto md:mx-0">
                  <div className="h-4 w-4 bg-red-600/20 rounded animate-pulse" />
                  <SkeletonBlock className="h-6 w-32 rounded-lg" />
                </div>
                <SkeletonBlock className="h-12 w-64 xs:w-80 md:w-96 rounded mx-auto md:mx-0" />
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-5/6 rounded mx-auto md:mx-0" />
                  <SkeletonBlock className="h-4 w-4/5 rounded mx-auto md:mx-0" />
                </div>
              </div>

              {/* Values */}
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <SkeletonBlock className="w-6 h-6 rounded mt-1" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-5 w-32 rounded" />
                      <SkeletonBlock className="h-4 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Image */}
            <SkeletonBlock className="aspect-square w-full rounded-lg text-center lg:text-left" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
