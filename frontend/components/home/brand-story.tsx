// BrandStory: Tech-focused brand story section
"use client";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Cpu, Zap, Shield, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { SectionTitle } from "./shared/section-header";

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
    <Section spacing="xl" className="relativ">
      <Container size="lg" className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Side - Brand Story */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-full border border-primary-200/50 backdrop-blur-sm">
              <div
                className="w-2 h-2 bg-primary-500 rounded-full shadow-sm shadow-primary-500/50"
                style={{
                  animation: "pulse 3s ease-in-out infinite",
                }}
              ></div>
              <span className="text-sm font-[var(--font-inter)] font-semibold tracking-wide text-primary-700">
                Tech Excellence
              </span>
            </div>

            {/* Main Title - Exact same style as Department and Trending sections */}
            <div className="space-y-6">
              <SectionTitle italic="Empowering" bold="Tomorrow's Tech" />

              <p className="text-warm-gray-600 max-w-2xl text-lg font-[var(--font-inter)] font-light leading-relaxed">
                We&apos;re not just selling gadgets—we&apos;re connecting
                innovators with the tools that drive progress. Every device in
                our collection represents the perfect fusion of cutting-edge
                technology and practical utility.
              </p>
            </div>

            {/* Tech Values */}
            <div className="space-y-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 font-[var(--font-inter)]">
                Why Choose ShopHub Tech
              </h3>
              <div className="space-y-5">
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
          <div className="space-y-12">
            {/* Logo Section */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative group">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-primary-600/10 rounded-full blur-2xl scale-125 group-hover:scale-150 transition-transform duration-700"></div>

                {/* Logo container */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 font-[var(--font-inter)]">
                  Our Impact
                </h3>
                <p className="text-gray-600 font-[var(--font-inter)]">
                  Numbers that drive our mission forward
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.label}
                      className="flex items-center gap-4 p-4 bg-white/40 rounded-xl border border-white/30 hover:bg-white/60 transition-all duration-300"
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
      spacing="xl"
      className="relative bg-gradient-to-br from-gray-50 to-white"
    >
      <Container size="lg" className="relative z-10">
        <div className="space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100">
              <div className="animate-shimmer w-4 h-4 rounded bg-current" />
              <div className="animate-shimmer h-4 w-24 rounded bg-current" />
            </div>

            {/* Title */}
            <div className="space-y-4">
              <div className="animate-shimmer h-12 w-96 mx-auto rounded bg-current" />
              <div className="animate-shimmer h-6 w-80 mx-auto rounded bg-current" />
            </div>

            {/* Description */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="animate-shimmer h-4 w-full rounded bg-current" />
              <div className="animate-shimmer h-4 w-5/6 mx-auto rounded bg-current" />
              <div className="animate-shimmer h-4 w-4/5 mx-auto rounded bg-current" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="text-center space-y-4"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="animate-shimmer w-8 h-8 mx-auto rounded bg-current" />
                <div className="animate-shimmer h-8 w-16 mx-auto rounded bg-current" />
                <div className="animate-shimmer h-4 w-24 mx-auto rounded bg-current" />
              </div>
            ))}
          </div>

          {/* Content Section */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="animate-shimmer h-8 w-48 rounded bg-current" />
                <div className="space-y-3">
                  <div className="animate-shimmer h-4 w-full rounded bg-current" />
                  <div className="animate-shimmer h-4 w-5/6 rounded bg-current" />
                  <div className="animate-shimmer h-4 w-4/5 rounded bg-current" />
                </div>
              </div>

              {/* Values */}
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4"
                    style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                  >
                    <div className="animate-shimmer w-6 h-6 rounded bg-current mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="animate-shimmer h-5 w-32 rounded bg-current" />
                      <div className="animate-shimmer h-4 w-full rounded bg-current" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Image */}
            <div className="animate-shimmer aspect-square w-full rounded-2xl bg-current" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
