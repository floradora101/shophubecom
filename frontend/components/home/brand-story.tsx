// BrandStory: Tech-focused brand story section

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { Cpu, Zap, Shield, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { SectionTitle } from "./shared/section-header";
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

const achievements = [
  { value: "50K+", label: "Tech Enthusiasts", icon: Users },
  { value: "15K+", label: "Premium Gadgets", icon: Cpu },
  { value: "99%", label: "Satisfaction Rate", icon: TrendingUp },
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
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-full border border-primary-200/50 backdrop-blur-sm mx-auto lg:mx-0">
              <div
                className="w-2 h-2 bg-primary-500 rounded-full shadow-sm shadow-primary-500/50"
                style={{
                  animation: "pulse 3s ease-in-out infinite",
                }}
              ></div>
              <span className="text-sm font-[var(--font-inter)] font-semibold tracking-wide text-primary-600">
                Tech Excellence
              </span>
            </div>

            {/* Main Title - Exact same style as Department and Trending sections */}
            <div className="space-y-4 sm:space-y-6">
              <SectionTitle italic="Empowering" bold="Tomorrow's Tech" />

              <p className="text-warm-gray-600 max-w-2xl text-base sm:text-lg font-[var(--font-inter)] font-light leading-relaxed">
                We&apos;re not just selling gadgets—we&apos;re connecting
                innovators with the tools that drive progress. Every device in
                our collection represents the perfect fusion of cutting-edge
                technology and practical utility.
              </p>
            </div>

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
                      <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl flex items-center justify-center border border-primary-200/30 group-hover:shadow-lg transition-all duration-300">
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
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-primary-600/10 rounded-full blur-2xl scale-125 group-hover:scale-150 transition-transform duration-700"></div>

                {/* Logo container */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-white/30">
                  <Image
                    src="/logo.png"
                    alt="ShopHub Logo"
                    width={140}
                    height={140}
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

            {/* Achievements Grid */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 font-[var(--font-inter)]">
                  Our Impact
                </h3>
                <p className="text-gray-600 font-[var(--font-inter)] text-sm sm:text-base">
                  Numbers that drive our mission forward
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.label}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 rounded-xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                    >
                      <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl flex items-center justify-center border border-primary-200/30">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl lg:text-3xl font-black text-gray-900 font-[var(--font-inter)]">
                          {achievement.value}
                        </div>
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide font-[var(--font-inter)]">
                          {achievement.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100">
              <SkeletonBlock className="w-4 h-4 rounded" />
              <SkeletonBlock className="h-4 w-24 rounded" />
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

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="text-center space-y-4">
                <SkeletonBlock className="w-8 h-8 mx-auto rounded" />
                <SkeletonBlock className="h-8 w-16 mx-auto rounded" />
                <SkeletonBlock className="h-4 w-24 mx-auto rounded" />
              </div>
            ))}
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <SkeletonBlock className="h-8 w-48 rounded" />
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-5/6 rounded" />
                  <SkeletonBlock className="h-4 w-4/5 rounded" />
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
            <SkeletonBlock className="aspect-square w-full rounded-2xl text-center lg:text-left" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
