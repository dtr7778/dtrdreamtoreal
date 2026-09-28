import { Star } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

export function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            index < rating
              ? "fill-primary text-primary"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  );
}
