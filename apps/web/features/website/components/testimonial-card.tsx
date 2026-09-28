import { Quote } from "lucide-react";

import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";

import { Reveal } from "./motion";
import { StarRating } from "./star-rating";

export function TestimonialCard({
  quote,
  name,
  role,
  company,
  rating,
}: {
  quote: string;
  name: string;
  role: string;
  company?: string;
  rating?: number;
}) {
  return (
    <Reveal hover className="h-full">
      <Card className="h-full gap-4 p-6 ring-border">
        <div className="flex items-center justify-between gap-3">
          <Quote aria-hidden="true" className="size-6 text-primary/40" />
          {rating ? <StarRating rating={rating} /> : null}
        </div>
        <CardContent className="p-0">
          <blockquote className="text-sm/relaxed text-foreground">
            &ldquo;{quote}&rdquo;
          </blockquote>
        </CardContent>
        <CardFooter className="mt-auto border-t border-border p-0 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">
                {role}
                {company ? `, ${company}` : ""}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Reveal>
  );
}
