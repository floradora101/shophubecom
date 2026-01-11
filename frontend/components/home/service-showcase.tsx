// Service Showcase: Cyberpunk tech services with advanced visual design
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Smartphone,
  CreditCard,
  Headphones,
  PenTool,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SectionTitle } from "./shared/section-header";

const services = [
  {
    title: "Phone Maintenance",
    description:
      "Professional phone repairs with certified technicians and genuine premium parts. Fast turnaround with 90-day warranty coverage.",
    features: [
      "Screen Replacement",
      "Battery Service",
      "Camera Repair",
      "Water Damage",
    ],
    icon: Smartphone,
    gradient: "from-primary-500 via-primary-600 to-primary-700",
    iconBg: "bg-gradient-to-br from-primary-500/20 to-primary-600/10",
    accentColor: "text-primary-400",
    glowColor: "shadow-primary-500/25",
    techElements: ["Circuit Board", "Microchips", "Laser Welding"],
    stats: { rating: 4.9, completed: "15K+", turnaround: "<24h" },
  },
  {
    title: "Digital Cards & Gaming",
    description:
      "Instant digital recharge cards for gaming, internet, and mobile services. Competitive rates with immediate delivery.",
    subtitle: "PlayStation • Xbox • Google Play • Steam",
    features: [
      "Instant Delivery",
      "Best Rates",
      "All Platforms",
      "Secure Payment",
    ],
    icon: CreditCard,
    gradient: "from-primary-600 via-primary-700 to-primary-800",
    iconBg: "bg-gradient-to-br from-primary-600/20 to-primary-700/10",
    accentColor: "text-primary-400",
    glowColor: "shadow-primary-600/25",
    techElements: ["Digital Tokens", "Blockchain", "Instant Transfer"],
    stats: { rating: 4.8, completed: "25K+", turnaround: "<5min" },
  },
  {
    title: "Audio Device Cleaning",
    description:
      "Professional deep cleaning service for AirPods and audio devices. Restores sound quality and extends device lifespan.",
    features: [
      "Deep Cleaning",
      "Sound Quality",
      "Hygiene Service",
      "Performance Boost",
    ],
    icon: Headphones,
    gradient: "from-primary-500 via-primary-600 to-primary-700",
    iconBg: "bg-gradient-to-br from-primary-500/20 to-primary-600/10",
    accentColor: "text-primary-400",
    glowColor: "shadow-primary-500/25",
    techElements: ["Sonic Waves", "Nano Cleaning", "AI Diagnostics"],
    stats: { rating: 4.9, completed: "8K+", turnaround: "<1h" },
  },
  {
    title: "Personalized Engraving",
    description:
      "Custom laser engraving on premium devices. High-precision personalization for IQOS, AirPods, and phone cases.",
    features: [
      "Laser Precision",
      "Premium Materials",
      "Custom Designs",
      "Lifetime Warranty",
    ],
    icon: PenTool,
    gradient: "from-primary-600 via-primary-700 to-primary-800",
    iconBg: "bg-gradient-to-br from-primary-600/20 to-primary-700/10",
    accentColor: "text-primary-400",
    glowColor: "shadow-primary-600/25",
    techElements: ["Laser Tech", "3D Mapping", "Precision CNC"],
    stats: { rating: 5.0, completed: "12K+", turnaround: "<2h" },
  },
];

// Cyberpunk Service Card Component
function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  const Icon = service.icon;

  return (
    <div
      className="group relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-900/50 overflow-hidden"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary-400/20 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-primary-400/20 rounded-bl-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-primary-400/10 rounded-full" />
      </div>

      {/* Hover Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-lg blur-xl`}
      />

      {/* Tech Icon Section */}
      <div className="relative flex justify-center mb-3 sm:mb-4 lg:mb-6">
        <div className="relative">
          {/* Multi-layer Glow Effects */}
          <div
            className={`absolute inset-0 ${service.iconBg} rounded-lg blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 scale-125`}
          />
          <div
            className={`absolute inset-0 ${service.iconBg} rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 scale-110`}
          />

          {/* Main Icon Container */}
          <div
            className={`relative p-3 sm:p-4 lg:p-6 ${service.iconBg} rounded-lg border border-gray-600/30 group-hover:border-gray-500/50 group-hover:scale-110 transition-all duration-500 ${service.glowColor} group-hover:shadow-2xl`}
          >
            <Icon
              className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${service.accentColor} drop-shadow-lg`}
            />

            {/* Animated Dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
          </div>

          {/* Scanning Line Effect */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse opacity-0 group-hover:opacity-80" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative text-center space-y-2 sm:space-y-3 lg:space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2 sm:space-y-3">
          <h3
            className={`text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300`}
          >
            {service.title}
          </h3>

          {service.subtitle && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-600/30">
              <Zap className="h-3 w-3 text-primary-400" />
              <span className="text-xs text-primary-400 font-medium">
                {service.subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-3 w-3 text-primary-400" />
            <span>{service.stats.turnaround}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">
          {service.description}
        </p>

        {/* Tech Elements */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
          {service.techElements.slice(0, 2).map((tech, techIndex) => (
            <span
              key={tech}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800/50 text-gray-300 rounded-md border border-gray-600/30 backdrop-blur-sm"
              style={{
                animationDelay: `${techIndex * 100 + 300}ms`,
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 flex-1">
          {service.features.slice(0, 3).map((feature, featureIndex) => (
            <div
              key={feature}
              className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              style={{
                transitionDelay: `${featureIndex * 100 + 400}ms`,
              }}
            >
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary-400 rounded-full animate-pulse" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>

        {/* Bottom Accent */}
        <div
          className={`h-1 bg-gradient-to-r ${service.gradient} rounded-full opacity-40 group-hover:opacity-80 group-hover:h-2 transition-all duration-500`}
        />
      </div>
    </div>
  );
}

export function ServiceShowcase() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Advanced Tech Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(250,6,3,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(250,6,3,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,6,3,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(250,6,3,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Floating Tech Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-primary-400/20 rounded-lg rotate-12 animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-primary-500/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 w-20 h-20 border border-primary-600/20 rounded-lg rotate-45 animate-pulse delay-500" />
        <div className="absolute top-1/2 right-20 w-16 h-16 border border-primary-700/20 rounded-full animate-pulse delay-1500" />

        {/* Data Flow Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent animate-pulse delay-2000" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Cyberpunk Header */}
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-600/15 to-primary-700/20 backdrop-blur-md border border-primary-400/30 shadow-xl shadow-primary-500/20">
              <div className="relative">
                <Zap className="h-6 w-6 text-primary-400 animate-pulse" />
                <div className="absolute inset-0 bg-primary-400/50 rounded-full blur-sm animate-ping" />
              </div>
              <span className="text-white font-bold tracking-wider text-sm">
                ADVANCED TECH SERVICES
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-100" />
                <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse delay-200" />
              </div>
            </div>

            {/* Title with Gradient */}
            <div className="relative">
              <SectionTitle
                italic="Expert Maintenance"
                bold="& Customization"
                className="text-white"
              />
              {/* Animated Circuit Border */}
              <div className="absolute -inset-8 border border-primary-400/20 rounded-lg animate-pulse" />
              <div className="absolute -inset-4 border border-primary-500/15 rounded-lg animate-pulse delay-500" />
            </div>

            {/* Enhanced Description */}
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-300 text-sm md:text-lg leading-relaxed mb-6">
                Cutting-edge maintenance and personalization services for all
                your smart devices. Powered by certified technicians using
                premium tools and AI-driven diagnostics.
              </p>

              {/* Trust Indicators Row */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-800/50 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span className="text-gray-300">Certified Technicians</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-800/50 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary-400" />
                  <span className="text-gray-300">90-Day Warranty</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-800/50 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                  <span className="text-gray-300">Same-Day Service</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-800/50 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
                  <span className="text-gray-300">AI Diagnostics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          {mounted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <ServiceCard service={service} index={index} />
                </div>
              ))}
            </div>
          )}

          {/* Bottom Tech Accent */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md rounded-full border border-gray-600/30">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse delay-200" />
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse delay-400" />
                <div className="w-1.5 h-1.5 bg-primary-700 rounded-full animate-pulse delay-600" />
              </div>
              <span className="text-gray-400 text-xs font-medium">
                Premium Quality Assured
              </span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary-700 rounded-full animate-pulse delay-600" />
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse delay-400" />
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse delay-200" />
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Cyberpunk skeleton loader for ServiceShowcase component
 */
export function ServiceShowcaseSkeleton() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Cyberpunk Header Skeleton */}
          <div className="text-center space-y-6">
            <SkeletonBlock className="h-12 w-80 mx-auto rounded-full" />
            <div className="space-y-4">
              <SkeletonBlock className="h-16 w-96 mx-auto rounded" />
              <SkeletonBlock className="h-6 w-[600px] mx-auto rounded" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <SkeletonBlock key={i} className="h-10 w-40 rounded-full" />
              ))}
            </div>
          </div>

          {/* Cyberpunk Services Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-lg p-8 border border-gray-700/50 min-h-[420px] flex flex-col relative overflow-hidden"
              >
                {/* Tech pattern skeleton */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gray-600 rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gray-600 rounded-bl-3xl" />
                </div>

                {/* Icon placeholder */}
                <div className="flex justify-center mb-6 relative z-10">
                  <SkeletonBlock className="w-24 h-24 rounded-lg" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-4 flex-1 relative z-10">
                  <div className="text-center space-y-3">
                    <SkeletonBlock className="h-6 w-32 mx-auto rounded" />
                    <SkeletonBlock className="h-4 w-24 mx-auto rounded-full" />
                    <div className="flex justify-center gap-4">
                      <SkeletonBlock className="h-3 w-8 rounded" />
                    </div>
                    <SkeletonBlock className="h-4 w-full rounded" />
                    <SkeletonBlock className="h-4 w-4/5 mx-auto rounded" />
                  </div>

                  {/* Tech elements skeleton */}
                  <div className="flex flex-wrap justify-center gap-2 opacity-50">
                    {Array.from({ length: 3 }, (_, j) => (
                      <SkeletonBlock key={j} className="h-5 w-16 rounded-md" />
                    ))}
                  </div>

                  {/* Features skeleton */}
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }, (_, k) => (
                      <div key={k} className="flex items-center gap-2">
                        <SkeletonBlock className="w-2 h-2 rounded-full" />
                        <SkeletonBlock className="h-3 w-16 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent skeleton */}
                <SkeletonBlock className="h-1 w-full rounded-full mt-4" />
              </div>
            ))}
          </div>

          {/* Bottom accent skeleton */}
          <div className="flex justify-center">
            <SkeletonBlock className="h-12 w-96 rounded-full" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
