import * as React from "react";
import { Button, ButtonProps } from "./button";

/**
 * LoadingButton - Standardized button component for actions with loading states
 *
 * Features:
 * - Inline spinner during loading
 * - Automatic disabled state during loading
 * - Accessible aria-busy attribute
 * - Consistent loading text or custom loading text
 * - Follows loading-policy.md guidelines
 */
export interface LoadingButtonProps extends Omit<ButtonProps, 'isLoading'> {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText = "Loading...", children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        isLoading={loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? loadingText : children}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
