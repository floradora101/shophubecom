"use client";

import { useState, useEffect } from "react";
import { HeroItem } from "./shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";

interface SlideData {
  id: string;
  title: string;
  badge: string;
  headline: string;
  desc: string;
}

interface TestSlideProps {
  slide: SlideData;
  isActive: boolean;
}

/**
 * Individual slide component that properly uses the useHeroRunCounter hook
 */
function TestSlide({ slide, isActive }: TestSlideProps) {
  const { run, animationKey } = useHeroRunCounter(isActive);

  return (
    <div
      className={`p-6 border rounded-lg ${
        isActive
          ? "border-green-500 bg-gray-800"
          : "border-gray-600 bg-gray-700"
      }`}
    >
      <h2 className="text-xl font-semibold mb-2">{slide.title}</h2>
      <p className="mb-4">
        Active: {isActive ? "YES" : "NO"} | Run: {run}
      </p>

      <div data-run={run} className="space-y-3">
        <HeroItem run={run} animationKey={animationKey}>
          <div className="hero-item-enter hero-badge bg-red-500 text-white px-3 py-1 rounded-full inline-block">
            {slide.badge}
          </div>
        </HeroItem>

        <HeroItem run={run} animationKey={animationKey}>
          <h1 className="hero-item-enter hero-headline text-3xl font-bold text-blue-400">
            {slide.headline}
          </h1>
        </HeroItem>

        <HeroItem run={run} animationKey={animationKey}>
          <p className="hero-item-enter hero-description text-gray-300">
            {slide.desc}
          </p>
        </HeroItem>

        <HeroItem run={run} animationKey={animationKey}>
          <div className="hero-item-enter hero-buttons">
            <button className="bg-purple-600 text-white px-4 py-2 rounded">
              Learn More
            </button>
          </div>
        </HeroItem>
      </div>
    </div>
  );
}

/**
 * Test component to verify hero animation behavior
 * This component simulates slide changes to test:
 * - Layout neutrality with display: contents
 * - Animation retriggering via data-run
 * - Staggered animations
 * - Reduced motion handling
 */
export function TestHeroAnimation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides: SlideData[] = [
    {
      id: "slide-1",
      title: "First Slide",
      badge: "Welcome",
      headline: "Hello World",
      desc: "This is the first slide",
    },
    {
      id: "slide-2",
      title: "Second Slide",
      badge: "Explore",
      headline: "Discover More",
      desc: "This is the second slide",
    },
    {
      id: "slide-3",
      title: "Third Slide",
      badge: "Premium",
      headline: "Best Quality",
      desc: "This is the third slide",
    },
  ];

  // Auto-advance slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Hero Animation Test - Auto-advancing Slides
      </h1>
      <p className="mb-4">
        Current slide: {currentSlide + 1} / {slides.length}
      </p>

      <div className="space-y-8">
        {slides.map((slide, index) => (
          <TestSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Slides should auto-advance every 3 seconds</li>
          <li>Only the active slide should have a green border</li>
          <li>When a slide becomes active, its run counter should increment</li>
          <li>
            Elements should animate in with staggered delays when becoming
            active
          </li>
          <li>Layout should remain stable (no jumping/shifting)</li>
        </ul>
      </div>
    </div>
  );
}
