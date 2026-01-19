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
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SectionHeader } from "./shared/section-header";
import { SparkleEffect } from "./hero/shared/SparkleEffect";

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
    accentColor: "text-primary-400",
    stats: { completed: "15K+", turnaround: "<24h" },
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
    accentColor: "text-primary-400",
    stats: { completed: "25K+", turnaround: "<5min" },
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
    accentColor: "text-primary-400",
    stats: { completed: "8K+", turnaround: "<1h" },
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
    accentColor: "text-primary-400",
    stats: { completed: "12K+", turnaround: "<2h" },
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
      className="group relative bg-gray-800/40 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/5 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-900/20 overflow-hidden flex flex-col h-full"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Subtle Hover Glow - Consistent with website cards */}
      <div className="absolute -inset-1 bg-linear-to-r from-primary-600/10 to-transparent rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Tech Icon Section - Simplified & Consistent */}
      <div className="relative mb-6">
        <div className="inline-flex items-center justify-center p-4 rounded-lg bg-gray-900/50 border border-white/5 group-hover:border-primary-500/50 group-hover:bg-primary-600/5 transition-all duration-500 shadow-xl">
          <Icon
            className={`h-8 w-8 sm:h-10 sm:w-10 ${service.accentColor} transition-transform duration-500 group-hover:scale-110`}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="relative space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors duration-300">
            {service.title}
          </h3>

          {service.subtitle && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20">
              <Zap className="h-3 w-3 text-primary-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500">
                {service.subtitle}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {service.description}
        </p>

        {/* Features List - Clean & Professional */}
        <div className="space-y-2 pt-2 flex-1">
          {service.features.slice(0, 3).map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5 text-primary-500/70" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats Row - Simplified */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <Clock className="h-3 w-3 text-primary-500/70" />
            <span>{service.stats.turnaround}</span>
          </div>
        </div>
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
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-gray-900"
      withContainer={false}
    >
      <SparkleEffect count={20} className="opacity-40" />

      {/* Modern Background Effects matching Footer Subscription */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(250,6,3,0.05)_0%,transparent_70%)]" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-8 sm:space-y-12">
          {/* Section Header - Consistent with website design */}
          <SectionHeader
            badge={{
              icon: Zap,
              text: "Advanced Services",
            }}
            title={{
              italic: "Expert",
              bold: "Maintenance",
            }}
            description="Cutting-edge maintenance and personalization services for all your smart devices. Powered by certified technicians using premium tools and AI-driven diagnostics."
          />

          {/* Services Grid */}
          {mounted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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

          {/* Bottom Trust Row - Consistent with website styling */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-8 border-t border-white/5">
            {[
              {
                icon: Shield,
                label: "Certified Technicians",
                color: "text-green-400",
              },
              {
                icon: Zap,
                label: "Same-Day Service",
                color: "text-yellow-400",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 group cursor-default"
              >
                <div className="bg-gray-800/50 p-2 rounded-xl border border-white/5 transition-all duration-300 group-hover:border-primary-600/50 group-hover:bg-primary-600/5">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Consistent skeleton loader for ServiceShowcase component
 */
export function ServiceShowcaseSkeleton() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-gray-900"
      withContainer={false}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/10 blur-[100px] rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-12">
          {/* Header Skeleton */}
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 mb-2 mx-auto md:mx-0">
              <div className="h-4 w-4 bg-red-600/20 rounded animate-pulse" />
              <SkeletonBlock className="h-6 w-32 rounded-lg" />
            </div>
            <SkeletonBlock className="h-12 w-64 xs:w-80 md:w-96 rounded mx-auto md:mx-0" />
            <SkeletonBlock className="h-6 w-full max-w-2xl rounded mx-auto md:mx-0" />
          </div>

          {/* Services Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-gray-800/40 backdrop-blur-md rounded-lg p-8 border border-white/5 min-h-[400px] flex flex-col relative overflow-hidden"
              >
                {/* Icon placeholder */}
                <div className="mb-6">
                  <SkeletonBlock className="w-16 h-16 rounded-lg" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <SkeletonBlock className="h-6 w-32 rounded" />
                    <SkeletonBlock className="h-4 w-24 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-4/5 rounded" />

                  {/* Features skeleton */}
                  <div className="space-y-2 mt-4">
                    {Array.from({ length: 3 }, (_, k) => (
                      <div key={k} className="flex items-center gap-2">
                        <SkeletonBlock className="w-4 h-4 rounded-full" />
                        <SkeletonBlock className="h-3 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent skeleton */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-white/5">
                  <SkeletonBlock className="h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust row skeleton */}
          <div className="flex justify-center gap-8 pt-8 border-t border-white/5">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-xl" />
                <SkeletonBlock className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
