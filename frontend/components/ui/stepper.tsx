// Stepper component for multi-step progress indication
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { Check, Circle } from "lucide-react";

export type StepState = "done" | "active" | "upcoming";

export interface Step {
  label: string;
  href?: string;
  state: StepState;
}

export interface StepperProps {
  steps: Step[];
  /** Show labels on mobile */
  showLabelsOnMobile?: boolean;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  showLabelsOnMobile = false,
  className,
}) => {
  return (
    <nav
      className={cn("flex items-center justify-center", className)}
      aria-label="Progress"
    >
      <ol className="flex items-center space-x-3 sm:space-x-6">
        {steps.map((step, index) => {
          const isCompleted = step.state === "done";
          const isActive = step.state === "active";
          const isUpcoming = step.state === "upcoming";

          const StepIcon = isCompleted ? Check : Circle;

          const stepContent = (
            <li className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted &&
                      "border-primary-500 bg-primary-500 text-white",
                    isActive && "border-primary-500 bg-white text-primary-600",
                    isUpcoming &&
                      "border-warm-gray-300 bg-white text-warm-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    showLabelsOnMobile ? "block" : "hidden sm:block",
                    isCompleted && "text-primary-600",
                    isActive && "text-primary-600",
                    isUpcoming && "text-warm-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px w-6 transition-colors sm:w-12",
                    isCompleted ? "bg-primary-500" : "bg-warm-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );

          // Make clickable if href provided and not upcoming
          if (step.href && !isUpcoming) {
            return (
              <Link
                key={step.label}
                href={step.href}
                className="hover:opacity-80 transition-opacity focus:outline-none rounded"
              >
                {stepContent}
              </Link>
            );
          }

          return (
            <React.Fragment key={step.label}>{stepContent}</React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export { Stepper };
