// Professional footer with CTA and enhanced design matching website vibes.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  Truck,
  Headphones,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
import Image from "next/image";
import { ui } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils/cn";
import { useCategoriesTreeQuery } from "@/features/categories/queries";
import { SparkleEffect } from "@/components/ui/SparkleEffect";
import type { Category } from "@/features/products/types";
import { productRoutes } from "@/lib/routes";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Accordion state for mobile
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Fetch categories from API (tree query returns root categories with children)
  const { data: categoriesTree = [] } = useCategoriesTreeQuery();
  // Extract main categories (root level categories)
  const mainCategories = categoriesTree.filter(cat => !cat.parentId) || [];

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Removed fake delay
    setSubmitted(true);
    setIsSubmitting(false);
    setEmail("");

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <footer className="relative border-t border-gray-200" role="contentinfo">
      {/* CTA Section */}
      <div className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
        <SparkleEffect count={20} className="opacity-40" />
        {/* Modern Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/20 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(250,6,3,0.05)_0%,transparent_70%)]" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              {/* Icon with premium treatment */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary-600/40 rounded-3xl blur-2xl group-hover:bg-primary-600/60 transition-all duration-500 animate-pulse-slow" />
                  <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Mail className="h-10 w-10 text-primary-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Heading
                  level="h2"
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight font-display"
                >
                  Join the <span className="text-primary-500 italic">Exclusive</span> List
                </Heading>
                <Text className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-body leading-relaxed">
                  Get early access to drops, member-only deals, and shopping tips.
                  Join <span className="text-white font-semibold">10,000+</span> luxury shoppers worldwide.
                </Text>
              </div>

              {/* Newsletter Form - Ultra Modern Design */}
              <div className="max-w-xl mx-auto mt-10">
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-linear-to-r from-primary-600/50 to-primary-800/50 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl">
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-14 pl-12 text-white placeholder:text-gray-500 text-lg"
                        disabled={isSubmitting || submitted}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || submitted}
                      className="bg-primary-600 hover:bg-primary-700 text-white shadow-xl transition-all duration-300 ease-out font-bold h-14 px-10 rounded-xl group"
                    >
                      {submitted ? (
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span>Subscribed</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>{isSubmitting ? "Wait..." : "Subscribe"}</span>
                          {!isSubmitting && <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                {submitted && (
                  <p className="text-primary-400 text-sm mt-4 font-medium animate-fade-in-up">
                    Welcome to the club! Check your inbox for your welcome gift.
                  </p>
                )}
              </div>

              {/* Trust Badges - Modern Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/5">
                {[
                  { icon: Truck, label: "Fast Shipping" },
                  { icon: Shield, label: "Secure Payments" },
                  { icon: Headphones, label: "Expert Support" },
                  { icon: CheckCircle2, label: "Quality Assured" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 group cursor-default"
                  >
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-white/5 transition-all duration-300 group-hover:border-primary-600/50 group-hover:bg-primary-600/5">
                      <item.icon className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-warm-gray-200">
          {/* Brand Section */}
          <div className="lg:col-span-1 lg:pr-8">
            <div className="flex items-center justify-center h-16 mb-5">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="object-contain hover:opacity-90 transition-opacity duration-200"
                sizes="120px"
              />
            </div>
            <Text
              variant="meta"
              className="text-warm-gray-600 leading-relaxed font-body text-center lg:text-left"
            >
              Your trusted online shopping destination. Quality products, fast
              delivery, and exceptional service. Shop smarter, live better.
            </Text>

            {/* Social Media Links */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-warm-gray-900 mb-3 text-center lg:text-left">
                Follow Us
              </p>
              <div className="flex justify-center lg:justify-start gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Shop by Category Section */}
          <div className="hidden lg:block lg:px-8">
            <h3 className="mb-5 text-base font-semibold text-warm-gray-900">
              Shop by Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/products"
                className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
              >
                View All Categories
              </Link>
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  href={productRoutes.category(category.slug)}
                  className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/cart"
                className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
              >
                Shopping Cart
              </Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="hidden lg:block lg:px-8">
            <h3 className="mb-5 text-base font-semibold text-warm-gray-900">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/shipping", label: "Shipping Info" },
                { href: "/returns", label: "Returns & Exchanges" },
                { href: "/faq", label: "FAQ" },
                { href: "/track-order", label: "Track Your Order" },
                { href: "/size-guide", label: "Size Guide" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div className="hidden lg:block lg:px-8">
            <h3 className="mb-5 text-base font-semibold text-warm-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/careers", label: "Careers" },
                { href: "/blog", label: "Blog" },
                { href: "/press", label: "Press" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="hidden lg:block lg:pl-8">
            <h3 className="mb-5 text-base font-semibold text-warm-gray-900">
              Get in Touch
            </h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <a
                    href="mailto:support@shophub.com"
                    className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                  >
                    support@shophub.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Phone
                  </p>
                  <a
                    href="tel:+15551234567"
                    className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Hours
                  </p>
                  <p className="text-sm text-warm-gray-700">
                    Mon-Fri: 9AM-6PM EST
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Mobile Accordion Sections */}
          <div className="lg:hidden space-y-4">
            {/* Shop by Category Section - Mobile */}
            <div className="border-b border-warm-gray-200 pb-4">
              <button
                onClick={() => toggleSection("shop")}
                className="flex items-center justify-between w-full text-left mb-3 focus:outline-none"
                aria-expanded={openSections.shop}
              >
                <h3 className="text-base font-semibold text-warm-gray-900">
                  Shop by Category
                </h3>
                {openSections.shop ? (
                  <ChevronUp className="h-5 w-5 text-warm-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-warm-gray-600" />
                )}
              </button>
              {openSections.shop && (
                <ul className="space-y-3 pl-4">
                  <li>
                    <Link
                      href="/products"
                      className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                    >
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                    >
                      View All Categories
                    </Link>
                  </li>
                  {mainCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={productRoutes.category(category.slug)}
                        className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/cart"
                      className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                    >
                      Shopping Cart
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Support Section - Mobile */}
            <div className="border-b border-warm-gray-200 pb-4">
              <button
                onClick={() => toggleSection("support")}
                className="flex items-center justify-between w-full text-left mb-3 focus:outline-none"
                aria-expanded={openSections.support}
              >
                <h3 className="text-base font-semibold text-warm-gray-900">
                  Support
                </h3>
                {openSections.support ? (
                  <ChevronUp className="h-5 w-5 text-warm-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-warm-gray-600" />
                )}
              </button>
              {openSections.support && (
                <ul className="space-y-3 pl-4">
                  {[
                    { href: "/shipping", label: "Shipping Info" },
                    { href: "/returns", label: "Returns & Exchanges" },
                    { href: "/faq", label: "FAQ" },
                    { href: "/track-order", label: "Track Your Order" },
                    { href: "/size-guide", label: "Size Guide" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Company Section - Mobile */}
            <div className="border-b border-warm-gray-200 pb-4">
              <button
                onClick={() => toggleSection("company")}
                className="flex items-center justify-between w-full text-left mb-3 focus:outline-none"
                aria-expanded={openSections.company}
              >
                <h3 className="text-base font-semibold text-warm-gray-900">
                  Company
                </h3>
                {openSections.company ? (
                  <ChevronUp className="h-5 w-5 text-warm-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-warm-gray-600" />
                )}
              </button>
              {openSections.company && (
                <ul className="space-y-3 pl-4">
                  {[
                    { href: "/about", label: "About Us" },
                    { href: "/careers", label: "Careers" },
                    { href: "/blog", label: "Blog" },
                    { href: "/press", label: "Press" },
                    { href: "/contact", label: "Contact Us" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-1 -my-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contact Section - Mobile */}
            <div className="border-b border-warm-gray-200 pb-4">
              <button
                onClick={() => toggleSection("contact")}
                className="flex items-center justify-between w-full text-left mb-3 focus:outline-none"
                aria-expanded={openSections.contact}
              >
                <h3 className="text-base font-semibold text-warm-gray-900">
                  Get in Touch
                </h3>
                {openSections.contact ? (
                  <ChevronUp className="h-5 w-5 text-warm-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-warm-gray-600" />
                )}
              </button>
              {openSections.contact && (
                <div className="pl-4">
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                          Email
                        </p>
                        <a
                          href="mailto:support@shophub.com"
                          className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                        >
                          support@shophub.com
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                          Phone
                        </p>
                        <a
                          href="tel:+15551234567"
                          className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                        >
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                          Hours
                        </p>
                        <p className="text-sm text-warm-gray-700">
                          Mon-Fri: 9AM-6PM EST
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal Links - Separated for better organization */}
        <div className="mt-12 pt-8 border-t border-warm-gray-200">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-warm-gray-500 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-2 py-1 -my-1"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-warm-gray-500 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-2 py-1 -my-1"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-warm-gray-500 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-2 py-1 -my-1"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="text-sm text-warm-gray-500 hover:text-primary-600 transition-colors focus:outline-none rounded-xl px-2 py-1 -my-1"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div
            className={cn(
              "flex flex-col md:flex-row items-center justify-between",
              ui.gap.sm
            )}
          >
            <p className="text-sm text-gray-700 text-center md:text-left">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            <div
              className={cn(
                "flex items-center text-sm text-gray-700",
                ui.gap.xs
              )}
            >
              <span>Made for shoppers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
