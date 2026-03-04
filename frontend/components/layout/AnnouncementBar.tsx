"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Truck, Info, Zap, Sparkles, Bell, Tag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveAnnouncementsQuery } from "@/features/announcements/queries";

const iconMap = {
  Truck: Truck,
  Sparkles: Sparkles,
  Zap: Zap,
  Info: Info,
  Bell: Bell,
  Tag: Tag,
  Gift: Gift
};

export function AnnouncementBar() {
  const { data: announcementsData = [], isLoading } = useActiveAnnouncementsQuery();

  const announcements = useMemo(() => {
    return announcementsData.filter(a => a.isActive).sort((a, b) => b.priority - a.priority);
  }, [announcementsData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating || announcements.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, announcements.length]);

  const prevSlide = useCallback(() => {
    if (isAnimating || announcements.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, announcements.length]);

  useEffect(() => {
    if (isPaused || announcements.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, announcements.length]);

  // Don't render if loading or no announcements
  if (isLoading || announcements.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-9 sm:h-10 bg-linear-to-r from-primary-600 via-primary-700 to-primary-600 text-white border-b border-primary-700/30 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto h-full px-4 flex items-center justify-center relative">
        {/* Navigation Arrows - Hidden on mobile, show on hover on desktop */}
        <button
          onClick={prevSlide}
          className="absolute left-4 z-20 p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 rounded-lg hidden md:flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Announcements Content Container */}
        <div className="relative w-full max-w-3xl overflow-hidden h-full">
          {announcements.map((announcement, index) => {
            const Icon = (iconMap[announcement.icon as keyof typeof iconMap] || Info) as any;
            const isActive = index === currentIndex;

            return (
              <div
                key={announcement.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] px-10",
                  isActive
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0"
                )}
                style={{
                  zIndex: isActive ? 10 : 0,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <div className="flex items-center gap-2 sm:gap-4 text-center">
                  <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium tracking-wider uppercase leading-none select-none">
                    <span className="text-white/90">{announcement.text.split(announcement.highlight)[0]}</span>
                    <span className="font-extrabold text-white bg-white/10 px-1.5 py-0.5 rounded-sm mx-0.5">{announcement.highlight}</span>
                    <span className="text-white/90">{announcement.text.split(announcement.highlight)[1]}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-4 z-20 p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 rounded-lg hidden md:flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Subtle Progress Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none z-20">
          {announcements.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-0.5 rounded-sm transition-all duration-500",
                index === currentIndex ? "bg-white w-4" : "bg-white/30 w-2"
              )}
            />
          ))}
        </div>
      </div>

      {/* Glossy overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-white/10 to-transparent opacity-50" />
    </div>
  );
}
