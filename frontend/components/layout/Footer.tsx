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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
import Image from "next/image";
import { ui } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils/cn";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            ui.gap.lg
          )}
        >
          {/* Brand Section */}
          <div className="space-y-5 lg:col-span-1">
            <div
              className={cn("flex items-center justify-center h-12", ui.gap.xs)}
            >
              <Image
                src="/logo.png"
                alt="ShopHub Logo"
                width={48}
                height={48}
                className="object-contain hover:opacity-90 transition-opacity duration-200"
              />
            </div>
            <Text
              variant="meta"
              className="text-warm-gray-600 leading-relaxed font-body"
            >
              Your trusted online shopping destination. Quality products, fast
              delivery, and exceptional service. Shop smarter, live better.
            </Text>

            {/* Social Media Links */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-warm-gray-900">
                Follow Us
              </p>
              <div className={cn("flex", ui.gap.xs)}>
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

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-base font-bold text-warm-gray-900 font-[var(--font-inter)]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "All Products" },
                {
                  href: "/products/category/electronics",
                  label: "Electronics",
                },
                { href: "/products/category/clothing", label: "Clothing" },
                {
                  href: "/products/category/home-garden",
                  label: "Home & Garden",
                },
                { href: "/products/category/books", label: "Books" },
                { href: "/cart", label: "Shopping Cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors font-[var(--font-inter)] focus:outline-none rounded-xl px-1 py-1 -my-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-5 text-base font-bold text-warm-gray-900 font-[var(--font-inter)]">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/shipping", label: "Shipping Info" },
                { href: "/returns", label: "Returns & Exchanges" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact Us" },
                { href: "/track-order", label: "Track Your Order" },
                { href: "/size-guide", label: "Size Guide" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm text-warm-gray-600 hover:text-primary-600 transition-colors font-[var(--font-inter)] focus:outline-none rounded-xl px-1 py-1 -my-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="mb-5 text-base font-bold text-warm-gray-900 font-[var(--font-inter)]">
              Get in Touch
            </h3>
            <ul className="space-y-4 mb-6">
              <li className={cn("flex items-start", ui.gap.xs)}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <a
                    href="mailto:support@shophub.com"
                    className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors font-[var(--font-inter)] focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                  >
                    support@shophub.com
                  </a>
                </div>
              </li>
              <li className={cn("flex items-start", ui.gap.xs)}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Phone
                  </p>
                  <a
                    href="tel:+15551234567"
                    className="text-sm text-warm-gray-700 hover:text-primary-600 transition-colors font-[var(--font-inter)] focus:outline-none rounded-xl px-1 py-0.5 -mx-1"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </li>
              <li className={cn("flex items-start", ui.gap.xs)}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-0.5">
                    Hours
                  </p>
                  <p className="text-sm text-warm-gray-700 font-[var(--font-inter)]">
                    Mon-Fri: 9AM-6PM EST
                  </p>
                </div>
              </li>
            </ul>

            <div className="pt-4 border-t border-warm-gray-200 space-y-2">
              <Link
                href="/privacy"
                className="text-xs text-warm-gray-500 hover:text-primary-600 transition-colors font-[var(--font-inter)] block focus:outline-none rounded-xl px-1 py-1 -my-1"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-warm-gray-500 hover:text-primary-600 transition-colors font-[var(--font-inter)] block focus:outline-none rounded-xl px-1 py-1 -my-1"
              >
                Terms of Service
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
            <p className="text-sm text-gray-700 text-center md:text-left font-[var(--font-inter)]">
              &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
            </p>
            <div
              className={cn(
                "flex items-center text-sm text-gray-700",
                ui.gap.xs
              )}
            >
              <span className="font-[var(--font-inter)]">
                Made for shoppers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
