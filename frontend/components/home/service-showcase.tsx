// Service Showcase: Premium professional tech services with elevated design

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Smartphone,
  CreditCard,
  Headphones,
  PenTool,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SectionTitle } from "./shared/section-header";
import { SlotStageCarousel } from "@/components/ui/slot-stage-carousel";

// Enhanced floating decorative elements with premium styling
const floatingElements = [
  {
    left: 12,
    top: 18,
    delay: 0,
    size: "w-3 h-3",
    intensity: "bg-primary-200/30",
  },
  {
    left: 87,
    top: 12,
    delay: 0.2,
    size: "w-2 h-2",
    intensity: "bg-primary-300/25",
  },
  {
    left: 22,
    top: 78,
    delay: 0.4,
    size: "w-4 h-4",
    intensity: "bg-primary-100/35",
  },
  {
    left: 92,
    top: 58,
    delay: 0.6,
    size: "w-2 h-2",
    intensity: "bg-primary-200/40",
  },
  {
    left: 42,
    top: 32,
    delay: 0.8,
    size: "w-3 h-3",
    intensity: "bg-primary-300/30",
  },
  {
    left: 72,
    top: 82,
    delay: 1.0,
    size: "w-2 h-2",
    intensity: "bg-primary-100/45",
  },
  {
    left: 8,
    top: 42,
    delay: 1.2,
    size: "w-3 h-3",
    intensity: "bg-primary-200/35",
  },
  {
    left: 97,
    top: 22,
    delay: 1.4,
    size: "w-2 h-2",
    intensity: "bg-primary-300/40",
  },
  {
    left: 58,
    top: 68,
    delay: 1.6,
    size: "w-2 h-2",
    intensity: "bg-primary-100/30",
  },
  {
    left: 32,
    top: 88,
    delay: 1.8,
    size: "w-3 h-3",
    intensity: "bg-primary-200/25",
  },
];

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
    gradient: "from-primary-500 via-primary-600 to-primary-600",
    iconBg: "bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200",
    accentColor: "text-primary-600",
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
    gradient: "from-primary-600 via-primary-600 to-primary-600",
    iconBg: "bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300",
    accentColor: "text-primary-600",
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
    gradient: "from-warm-gray-600 via-warm-gray-700 to-warm-gray-800",
    iconBg:
      "bg-gradient-to-br from-warm-gray-50 via-warm-gray-100 to-warm-gray-200",
    accentColor: "text-warm-gray-700",
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
    gradient: "from-primary-400 via-primary-500 to-primary-600",
    iconBg: "bg-gradient-to-br from-primary-25 via-primary-50 to-primary-100",
    accentColor: "text-primary-500",
  },
];

// Service Card Component for Carousel
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
      className="group relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl hover:shadow-primary-500/15 transition-all duration-700 hover:-translate-y-3 min-h-[380px] flex flex-col overflow-hidden w-[280px]"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Premium background gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />

      {/* Enhanced Icon Section */}
      <div className="relative flex justify-center mb-6">
        <div className="relative">
          {/* Icon glow effect */}
          <div
            className={`absolute inset-0 ${service.iconBg} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 scale-150`}
          />

          {/* Main icon container */}
          <div
            className={`relative p-6 ${service.iconBg} rounded-3xl shadow-xl border border-white/50 group-hover:shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700`}
          >
            <Icon
              className={`h-10 w-10 ${service.accentColor} drop-shadow-sm`}
            />
          </div>

          {/* Subtle shine effect */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </div>

      {/* Premium Content Section */}
      <div className="relative text-center space-y-5 flex-1 flex flex-col">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-warm-gray-900 font-(--font-dm-sans) leading-tight group-hover:text-primary-600 transition-colors duration-500">
            {service.title}
          </h3>

          {service.subtitle && (
            <p className="text-sm text-primary-600 font-semibold font-(--font-inter) bg-primary-50 px-3 py-1 rounded-full inline-block">
              {service.subtitle}
            </p>
          )}

          <p className="text-sm text-warm-gray-600 font-(--font-inter) leading-relaxed px-2">
            {service.description}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap justify-center gap-1.5">
            {service.features.map((feature, featureIndex) => (
              <span
                key={feature}
                className="text-xs px-2 py-1 bg-warm-gray-50 text-warm-gray-700 rounded-md font-(--font-inter) opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
                style={{
                  transitionDelay: `${featureIndex * 100}ms`,
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Premium gradient accent */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-24 transition-all duration-700" />
      </div>
    </div>
  );
}

export function ServiceShowcase() {
  const [mounted, setMounted] = useState(false);
  const [servicesActiveIndex, setServicesActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <Section spacing="xl" className="relative overflow-hidden">
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 -z-10">
        {floatingElements.map((pos, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${pos.intensity} animate-pulse blur-[0.5px]`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
              animationDuration: "4s",
              width: pos.size.split(" ")[0].replace("w-", ""),
              height: pos.size.split(" ")[1].replace("h-", ""),
            }}
          />
        ))}
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary-50/20 to-transparent -z-10" />

      <Container size="lg" className="relative z-10">
        <div className="space-y-20">
          {/* Enhanced Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="text-left space-y-6 flex-1">
              <div className="inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary-100 via-primary-200/80 to-primary-100 shadow-sm border border-primary-200/50">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600 font-(--font-inter) tracking-wide">
                  Professional Tech Services
                </span>
              </div>

              <SectionTitle
                italic="Expert Maintenance"
                bold="& Customization"
              />

              <p className="text-warm-gray-600 max-w-2xl text-lg font-(--font-inter) font-light leading-relaxed">
                Premium maintenance and personalization services for all your
                smart devices. Trusted by thousands with certified quality and
                satisfaction guarantee.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col gap-3 md:ml-8">
              <div className="flex items-center gap-2 text-sm text-warm-gray-600 font-(--font-inter)">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Certified Technicians</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-gray-600 font-(--font-inter)">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>90-Day Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-gray-600 font-(--font-inter)">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Same-Day Service</span>
              </div>
            </div>
          </div>

          {/* Services Carousel */}
          {mounted && (
            <SlotStageCarousel
              items={services}
              activeIndex={servicesActiveIndex}
              onActiveIndexChange={setServicesActiveIndex}
              isMobile={isMobile}
              renderCard={(service, index) => (
                <ServiceCard service={service} index={index} />
              )}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

/**
 * Premium skeleton loader for ServiceShowcase component
 */
export function ServiceShowcaseSkeleton() {
  return (
    <Section spacing="xl" className="relative overflow-hidden">
      <Container size="lg" className="relative z-10">
        <div className="space-y-20">
          {/* Enhanced Header Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="text-left space-y-6 flex-1">
              <SkeletonBlock className="h-10 w-56 rounded-full" />
              <div className="space-y-4">
                <SkeletonBlock className="h-14 w-80 rounded" />
                <SkeletonBlock className="h-6 w-96 rounded" />
                <SkeletonBlock className="h-6 w-80 rounded" />
              </div>
            </div>

            {/* Trust indicators skeleton */}
            <div className="flex flex-col gap-3 md:ml-8 space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonBlock key={i} className="h-5 w-32 rounded" />
              ))}
            </div>
          </div>

          {/* Premium Services Grid Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30 min-h-[380px] flex flex-col"
              >
                {/* Icon placeholder */}
                <div className="flex justify-center mb-6">
                  <SkeletonBlock className="w-20 h-20 rounded-3xl" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-5 flex-1">
                  <div className="text-center space-y-4">
                    <SkeletonBlock className="h-6 w-24 mx-auto rounded" />
                    <SkeletonBlock className="h-4 w-20 mx-auto rounded" />
                    <SkeletonBlock className="h-4 w-full rounded" />
                    <SkeletonBlock className="h-4 w-3/4 mx-auto rounded" />
                  </div>

                  {/* Features skeleton */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {Array.from({ length: 4 }, (_, j) => (
                      <SkeletonBlock key={j} className="h-6 w-16 rounded-md" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
