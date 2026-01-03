import { memo, useState, useEffect } from "react";
import { Clock, Copy, Check, Zap, Tag, Gift } from "lucide-react";
import { HeroCTAs } from "../../shared/hero-ctas";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface OfferSlideBodyProps {
  slide: HeroSlide & { type: "OFFER" };
  isActive: boolean;
  index: number;
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" style={{ color: "var(--hero-accent)" }} />
      <div className="flex gap-1 font-mono text-sm font-bold tabular-nums">
        <span
          className="px-2 py-1 rounded"
          style={{ color: "var(--hero-text)" }}
        >
          {String(timeLeft.days).padStart(2, "0")}
        </span>
        <span style={{ color: "var(--hero-muted)" }}>:</span>
        <span
          className="px-2 py-1 rounded"
          style={{ color: "var(--hero-text)" }}
        >
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span style={{ color: "var(--hero-muted)" }}>:</span>
        <span
          className="px-2 py-1 rounded"
          style={{ color: "var(--hero-text)" }}
        >
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span style={{ color: "var(--hero-muted)" }}>:</span>
        <span
          className="px-2 py-1 rounded"
          style={{ color: "var(--hero-text)" }}
        >
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function PromoCodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="hero-pill flex items-center gap-2 font-bold text-sm transition-all duration-200 hover:scale-105"
    >
      <Tag className="w-4 h-4" />
      <span className="font-mono">{code}</span>
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

function DealGraphic({
  urgencyLevel = "medium",
}: {
  urgencyLevel?: "low" | "medium" | "high";
}) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Subtle background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded-full opacity-20 animate-pulse"
          style={{
            backgroundColor: "var(--hero-accent)",
            animationDuration: "3s",
          }}
        />
        <div
          className="absolute w-24 h-24 rounded-full opacity-30 animate-pulse"
          style={{
            backgroundColor: "var(--hero-accent)",
            animationDelay: "1s",
            animationDuration: "4s",
          }}
        />
      </div>

      {/* Central icon */}
      <div className="hero-glass relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--hero-border)]">
        <Gift className="w-8 h-8 text-[var(--hero-accent)]" />
      </div>
    </div>
  );
}

export const OfferSlideBody = memo(function OfferSlideBody({
  slide,
  isActive,
  index,
}: OfferSlideBodyProps) {
  const urgencyLevel = "medium"; // Default for now, will be added to types later
  const dealPills: string[] = []; // Default for now, will be added to types later

  return (
    <SlideLayout
      textContent={
        <>
          {/* Urgency Badge */}
          <div className="hero-badge inline-flex items-center gap-2 text-sm font-bold">
            <Zap className="h-4 w-4" />
            <span>{slide.badgeText || "Limited Time"}</span>
          </div>

          {/* Offer Label - Large, prominent */}
          {slide.offerLabel && (
            <div
              className="text-3xl lg:text-4xl font-black tracking-wide"
              style={{ color: "var(--hero-accent)" }}
            >
              {slide.offerLabel}
            </div>
          )}

          {/* Headline */}
          <div className="space-y-3">
            <h1
              className={`text-4xl lg:text-5xl font-black leading-tight ${contentClamp.headline}`}
              style={{ color: "var(--hero-text)" }}
            >
              {slide.headline}
            </h1>
            {slide.highlight && (
              <h2
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: "var(--hero-text)" }}
              >
                {slide.highlight}
              </h2>
            )}
            <p
              className={`text-lg leading-relaxed ${contentClamp.description}`}
              style={{ color: "var(--hero-muted)" }}
            >
              {slide.description}
            </p>
          </div>

          {/* Countdown Timer */}
          {slide.offerEndsAt && <CountdownTimer endTime={slide.offerEndsAt} />}

          {/* Promo Code */}
          {slide.promoCode && <PromoCodeCopy code={slide.promoCode} />}

          {/* Deal Pills - Max 3 */}
          {dealPills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dealPills.slice(0, 3).map((pill: string, index: number) => (
                <div
                  key={index}
                  className="hero-pill px-3 py-1 text-sm font-medium"
                >
                  {pill}
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <HeroCTAs primary={slide.ctaPrimary} secondary={slide.ctaSecondary} />
        </>
      }
      mediaContent={
        slide.media.kind === "image" ? (
          <HeroMediaFrame slide={slide} isActive={isActive} />
        ) : (
          <div className="relative w-full h-full">
            <div
              className="rounded-3xl border shadow-xl overflow-hidden w-full h-full"
              style={{
                borderColor: "var(--hero-border)",
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 0 1px var(--hero-border)",
              }}
            >
              <DealGraphic urgencyLevel={urgencyLevel} />
            </div>
          </div>
        )
      }
    />
  );
});
