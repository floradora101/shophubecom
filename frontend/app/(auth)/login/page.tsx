// Login page route for signing users in.
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/spinner";
import { LoginForm } from "@/features/auth";

import { ShieldCheck, ArrowRight, Zap, Globe, Sparkles } from "lucide-react";
import { SparkleEffect } from "@/components/home/hero/shared/SparkleEffect";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/home/shared/section-header";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
      <div className="w-full max-w-[440px] mx-auto relative group">
        {/* Subtle decorative corners for the form area */}
        <div className="absolute -top-4 -left-4 w-6 h-6 border-t-2 border-l-2 border-primary-500/20" />
        <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b-2 border-r-2 border-primary-500/20" />

        <div className="flex flex-col gap-10">
          <div className="space-y-3 text-center">
            <Badge variant="primary" size="lg" className="mx-auto">
              <Sparkles className="w-3 h-3" />
              <span>Access_Grant</span>
            </Badge>
            <div className="space-y-1.5">
              <SectionTitle
                italic="Welcome"
                bold="Back"
                className="text-2xl md:text-3xl"
              />
              <p className="text-[13px] text-warm-gray-500 font-medium">
                Enter credentials to initialize session.
              </p>
            </div>
          </div>

          <LoginForm redirectUrl={redirect || undefined} />

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black text-warm-gray-400">
                <span className="bg-warm-gray-50 px-6">
                  Identity Management
                </span>
              </div>
            </div>

            <Link
              href={
                redirect
                  ? `/register?redirect=${encodeURIComponent(redirect)}`
                  : "/register"
              }
              className="group flex items-center justify-between w-full p-4 rounded-xl border border-warm-gray-100 hover:border-primary-500 hover:bg-white transition-all duration-500 shadow-xs hover:shadow-md"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-warm-gray-900 uppercase tracking-[0.1em] mb-0.5 transition-colors group-hover:text-primary-600">
                  Create New Account
                </p>
                <p className="text-[9px] text-warm-gray-400 font-medium font-mono uppercase">
                  Initialize Registry
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-inner">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="md" variant="inline" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
