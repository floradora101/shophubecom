// BrandStory: Creative and unique story section with logo
"use client";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heart, Sparkles, Award, Users } from "lucide-react";

const stats = [
  { value: "500K+", label: "Happy Customers", icon: Users },
  { value: "10K+", label: "Products Available", icon: Sparkles },
  { value: "100+", label: "Expert Curators", icon: Award },
];

const values = [
  {
    title: "Quality First",
    description: "Every product is handpicked by our expert team",
    icon: Award,
  },
  {
    title: "Customer Love",
    description: "Your satisfaction is our top priority",
    icon: Heart,
  },
  {
    title: "Curated Selection",
    description: "Only the best products make it to our collection",
    icon: Sparkles,
  },
];

export function BrandStory() {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary-50 to-primary-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <Container size="lg" className="relative z-10">
        <div className="space-y-16">
          {/* Logo and Title Section */}
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl font-[var(--font-righteous)]">
                    S
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 via-primary-100 to-primary-200 mb-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700 font-[var(--font-poppins)]">
                  About Us
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                <span className="font-[var(--font-playfair)] font-bold italic">
                  Our
                </span>
                <span className="font-[var(--font-poppins)] font-bold text-primary-600 ml-2">
                  Story
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-[var(--font-inter)] font-light leading-relaxed">
                Quality over quantity, design that lasts, service that goes
                beyond expectations
              </p>
            </div>
          </div>

          {/* Main Story Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Story Text */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                  Founded with a simple mission: to bring you thoughtfully
                  curated products that enhance your everyday life.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We believe in quality over quantity, design that lasts, and
                  service that goes beyond expectations. Every product in our
                  collection is handpicked by our team of experts, ensuring that
                  you receive only the best.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  From modern electronics to timeless home essentials, we're
                  here to help you create a space that reflects your unique
                  style. Join us on this journey of discovery, where every
                  purchase tells a story.
                </p>
              </div>
            </div>

            {/* Right: Values Grid */}
            <div className="grid grid-cols-1 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-white to-cream-50 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {value.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className="pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="text-center group"
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <div className="inline-flex items-center justify-center mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-2 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="text-center pt-8">
            <div className="inline-block max-w-2xl">
              <div className="relative">
                <div className="absolute -top-4 -left-4 text-6xl text-primary-200 font-[var(--font-playfair)] leading-none">
                  "
                </div>
                <p className="relative text-xl md:text-2xl text-gray-700 italic font-[var(--font-playfair)] leading-relaxed px-8">
                  We don't just sell products, we curate experiences that enrich
                  your life.
                </p>
                <div className="absolute -bottom-4 -right-4 text-6xl text-primary-200 font-[var(--font-playfair)] leading-none">
                  "
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-primary-300"></div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">
                  The ShopHub Team
                </span>
                <div className="h-px w-12 bg-primary-300"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
