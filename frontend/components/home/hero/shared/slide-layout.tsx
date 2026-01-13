import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SlideLayoutProps {
  textContent: ReactNode;
  mediaContent: ReactNode;
  className?: string;
  mediaFirst?: boolean;
}

export function SlideLayout({
  textContent,
  mediaContent,
  className,
  mediaFirst = false,
}: SlideLayoutProps) {
  return (
    <div
      className={cn("w-full h-full min-h-0 overflow-hidden group", className)}
    >
      <div className="px-2.5 sm:px-6 lg:px-14 h-full min-h-0 py-2 lg:py-0">
        <div
          data-scroll
          className={cn(
            "w-full h-full min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-visible lg:h-full scrollbar-hide"
          )}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 min-h-full lg:h-full w-full max-w-full px-0.5">
            <div
              data-text
              className={cn(
                "relative flex flex-col justify-center min-w-0 pt-2 lg:pt-0",
                mediaFirst ? "lg:order-2" : "lg:order-1",
                "w-full lg:w-[45%]"
              )}
            >
              <div className="grid grid-rows-[auto_auto_auto_auto_auto_auto] gap-1 lg:gap-2 w-full min-w-0 pb-2">
                {textContent}
              </div>
            </div>

            <div
              data-media
              className={cn(
                "flex justify-center lg:justify-end items-center lg:h-full min-w-0 pb-4 lg:pb-0",
                mediaFirst ? "lg:order-1" : "lg:order-2",
                "w-full lg:w-[55%]"
              )}
            >
              <div className="w-full max-w-full lg:max-w-[620px] aspect-square sm:aspect-auto sm:h-80 md:h-96 lg:h-full min-h-0 flex items-center py-2 lg:py-4">
                {mediaContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const contentClamp = {
  headline: "line-clamp-3 lg:line-clamp-2",
  description: "line-clamp-2",
  bullet: "line-clamp-1",
  cta: "truncate",
} as const;
