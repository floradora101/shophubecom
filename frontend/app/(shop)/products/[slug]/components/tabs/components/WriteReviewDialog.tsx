/**
 * WriteReviewDialog Component
 *
 * Modal form for submitting a product review. Backend-only (real mode).
 */

"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveStarRating } from "@/components/ui/star-rating";
import { useCreateReviewMutation } from "@/features/reviews/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";

const writeReviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

type WriteReviewFormData = z.infer<typeof writeReviewSchema>;

interface WriteReviewDialogProps {
  productIdOrSlug: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WriteReviewDialog({
  productIdOrSlug,
  productName,
  open,
  onOpenChange,
}: WriteReviewDialogProps) {
  const createMutation = useCreateReviewMutation(productIdOrSlug);

  const form = useForm<WriteReviewFormData>({
    resolver: zodResolver(writeReviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const { register, handleSubmit, setValue, reset, control } = form;
  const rating = useWatch({ control, name: "rating", defaultValue: 0 });

  const onSubmit = async (data: WriteReviewFormData) => {
    try {
      await createMutation.mutateAsync({
        rating: data.rating,
        title: data.title || undefined,
        comment: data.comment || undefined,
      });
      toast.success("Thank you! Your review has been submitted.");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to submit review."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <p className="text-sm text-muted-fg">{productName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg mb-2">
              Your rating *
            </label>
            <InteractiveStarRating
              value={rating}
              onChange={(v) => setValue("rating", v, { shouldValidate: true })}
              size="md"
            />
            {form.formState.errors.rating && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>

          <Input
            {...register("title")}
            label="Review title (optional)"
            placeholder="Summarize your experience"
            className="rounded-xl"
          />

          <Textarea
            {...register("comment")}
            placeholder="Share your thoughts about this product..."
            className="rounded-xl min-h-[120px]"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || rating < 1}
            >
              {createMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
