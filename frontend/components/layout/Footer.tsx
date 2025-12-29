// Professional footer with CTA and enhanced design matching website vibes.
"use client";

import { useState } from "react";
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
import { getMainCategories, getSubcategories } from "@/lib/mock-data/mock-data";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Accordion state for mobile
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Get categories from mock data
  const mainCategories = getMainCategories();

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
    setEmail("");

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <footer className="relative border-t border-gray-200" role="contentinfo">
      {/* CTA Section */}
      <div className="relative border-b border-gray-200 bg-primary-600">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              {/* Icon with animation */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-900/10 rounded-full blur-xl animate-pulse-slow" />
                  <div className="relative bg-gray-100/20 backdrop-blur-sm rounded-full p-4 border-2 border-gray-300/50">
                    <Mail className="h-8 w-8 text-gray-900" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Heading
                  level="h2"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display"
                >
                  Stay in the Loop
                </Heading>
                <Text className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-body">
                  Get exclusive deals, new arrivals, and shopping tips delivered
                  straight to your inbox. Join{" "}
                  <span className="font-semibold text-gray-900">10,000+</span>{" "}
                  happy shoppers!
                </Text>
              </div>

              {/* Newsletter Form */}
              <form
                onSubmit={handleNewsletterSubmit}
                className={cn(
                  "flex flex-col sm:flex-row max-w-lg mx-auto mt-8",
                  ui.gap.xs
                )}
              >
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/95 backdrop-blur-sm border-white/30 focus:border-white focus:ring-white/20 h-12 text-warm-gray-900 placeholder:text-warm-gray-500"
                    disabled={isSubmitting || submitted}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || submitted}
                  className="bg-white text-primary-600 hover:bg-primary-50/50 border-2 border-white/30 shadow-lg transition-all duration-300 ease-out font-semibold h-12 px-8 whitespace-nowrap"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Subscribed!
                    </>
                  ) : isSubmitting ? (
                    "Subscribing..."
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {submitted && (
                <p className="text-white/80 text-sm mt-2 animate-fade-in-up">
                  Welcome! Check your inbox for a special welcome offer.
                </p>
              )}

              {/* Trust Badges */}
              <div
                className={cn(
                  "flex flex-wrap justify-center mt-10 pt-8 border-t border-white/20",
                  ui.gap.md,
                  "md:" + ui.gap.lg
                )}
              >
                <div
                  className={cn("flex items-center text-white/90", ui.gap.xs)}
                >
                  <div className="bg-white/20 rounded-full p-1.5">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <div
                  className={cn("flex items-center text-white/90", ui.gap.xs)}
                >
                  <div className="bg-white/20 rounded-full p-1.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <div
                  className={cn("flex items-center text-white/90", ui.gap.xs)}
                >
                  <div className="bg-white/20 rounded-full p-1.5">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
                <div
                  className={cn("flex items-center text-white/90", ui.gap.xs)}
                >
                  <div className="bg-white/20 rounded-full p-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Easy Returns</span>
                </div>
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
                alt="ShopHub Logo"
                width={64}
                height={64}
                className="object-contain hover:opacity-90 transition-opacity duration-200"
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
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-warm-gray-200 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none"
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
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
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
                  {mainCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products/category/${category.slug}`}
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
              &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
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
