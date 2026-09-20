import { MapPin, MapPinned, Navigation, Pen, Star } from "lucide-react";

import type { SelectAddress } from "@workspace/drizzle/schemas";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

type AddressItem = SelectAddress & { isPrimary: boolean };

export function AddressCard({
  addresses,
  onEdit,
}: {
  addresses: AddressItem[];
  onEdit?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">Addresses</h3>
        </CardTitle>
        {onEdit && (
          <CardAction>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="icon-sm" variant="outline" onClick={onEdit} />
                }
              >
                <Pen />
              </TooltipTrigger>
              <TooltipContent>
                <p>Update</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">N/A</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPinned className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {address.streetLine1}
                    </p>
                    {address.streetLine2 && (
                      <p className="text-sm text-muted-foreground">
                        {address.streetLine2}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {[address.city, address.state, address.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant="outline" className="font-medium">
                    {formatEnumValue(address.type)}
                  </Badge>
                  {address.isPrimary && (
                    <Badge variant="secondary" className="gap-1 font-medium">
                      <Star
                        className="size-3 fill-current"
                        aria-hidden="true"
                      />
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
              {address.latitude && address.longitude && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Navigation className="size-3" aria-hidden="true" />
                  <span>
                    {address.latitude}, {address.longitude}
                  </span>
                </div>
              )}
              {address.notes && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {address.notes}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
