// Write Review Modal - Modern 2026 Design with Steps
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PenTool, X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveStarRating } from "@/components/ui/star-rating";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/features/products/types";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSubmit: (review: {
    rating: number;
    content: string;
    userName: string;
    userEmail: string;
  }) => void;
}

const STEPS = [
  {
    id: 1,
    title: "Rate the Product",
    description: "Share your overall experience",
  },
  {
    id: 2,
    title: "Write Your Review",
    description: "Tell others about your experience",
  },
  {
    id: 3,
    title: "Your Information",
    description: "Help us personalize your review",
  },
];

export function WriteReviewModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}: WriteReviewModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [errors, setErrors] = useState<{
    rating?: string;
    content?: string;
    userName?: string;
    userEmail?: string;
  }>({});

  const validateCurrentStep = () => {
    const newErrors: typeof errors = {};

    switch (currentStep) {
      case 1:
        if (rating === 0) {
          newErrors.rating = "Please select a rating";
        }
        break;
      case 2:
        if (!content.trim()) {
          newErrors.content = "Please enter your review content";
        }
        break;
      case 3:
        if (!userName.trim()) {
          newErrors.userName = "Please enter your name";
        }
        if (!userEmail.trim()) {
          newErrors.userEmail = "Please enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
          newErrors.userEmail = "Please enter a valid email address";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return rating > 0;
      case 2:
        return content.trim().length > 0;
      case 3:
        return (
          userName.trim() &&
          userEmail.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        content: content.trim(),
        userName: userName.trim(),
        userEmail: userEmail.trim(),
      });

      // Reset form
      setCurrentStep(1);
      setRating(0);
      setUserName("");
      setUserEmail("");
      setContent("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      setErrors({});
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const resetForm = () => {
    setCurrentStep(1);
    setRating(0);
    setUserName("");
    setUserEmail("");
    setContent("");
    setErrors({});
  };

  const handleClose = () => {
    if (rating > 0 || userName || userEmail || content) {
      if (
        confirm(
          "Are you sure you want to close? Your review will not be saved."
        )
      ) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const currentStepData = STEPS.find((step) => step.id === currentStep)!;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide scroll-smooth">
        <DialogHeader className="space-y-4 pb-6 border-b border-border">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    step.id <= currentStep
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-border text-muted-fg"
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1 transition-colors",
                      step.id < currentStep
                        ? "bg-primary-600"
                        : "bg-surface-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <DialogTitle className="text-xl font-semibold text-warm-gray-900">
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-warm-gray-600 mt-1">
              {currentStepData.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Product Info - Show on all steps */}
          <Card className="p-4 bg-surface-muted/50 border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                <Image
                  src={product.images?.[0] || "/placeholder-product.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-fg truncate">{product.name}</h3>
                <p className="text-sm text-warm-gray-600">
                  Help others make informed decisions
                </p>
              </div>
            </div>
          </Card>

          {/* Step Content */}
          <div className="min-h-[200px]">
            {currentStep === 1 && (
              <div className="text-center space-y-8">
                <div className="space-y-6">
                  <label className="block text-lg font-semibold text-warm-gray-900 mb-4">
                    How would you rate this product?
                  </label>

                  <div className="flex justify-center">
                    <div className="bg-warm-gray-50/50 rounded-2xl p-8 border border-warm-gray-200">
                      <InteractiveStarRating
                        value={rating}
                        onChange={setRating}
                        size="lg"
                      />
                    </div>
                  </div>

                  {errors.rating && (
                    <p className="text-sm text-red-600 mt-4">{errors.rating}</p>
                  )}

                  {rating > 0 && (
                    <p className="text-sm text-warm-gray-600 mt-4">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Textarea
                  label="Your Review"
                  placeholder="Tell others about your experience. What did you like or dislike? How does it perform?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  error={errors.content}
                  helperText={
                    !errors.content
                      ? `${content.length}/1000 characters`
                      : errors.content
                  }
                  maxLength={1000}
                  rows={6}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Enter your display name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    error={!!errors.userName}
                    maxLength={50}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      errors.userName ? "text-error" : "text-muted-fg"
                    }`}
                  >
                    {errors.userName || "This will be shown with your review"}
                  </p>

                  <Input
                    label="Your Email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    error={!!errors.userEmail}
                    maxLength={100}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      errors.userEmail ? "text-error" : "text-muted-fg"
                    }`}
                  >
                    {errors.userEmail || "We'll keep your email private"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevStep}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <ArrowLeft className="h-4 w-4 mr-2" />
            )}
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNextStep} disabled={!canProceedToNextStep()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceedToNextStep()}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
