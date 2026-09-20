import {
  Facebook01Icon,
  InstagramIcon,
  Link01Icon,
  Linkedin01Icon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ExternalLink, Pen, Share2 } from "lucide-react";

import type { SelectSocialMedia } from "@workspace/drizzle/schemas";
import { formatEnumValue } from "@workspace/lib/utils";
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

type SocialPlatform = SelectSocialMedia["platform"];

const platformIcons: Record<SocialPlatform, typeof XIcon> = {
  X: XIcon,
  linkedin: Linkedin01Icon,
  facebook: Facebook01Icon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  other: Link01Icon,
};

export function SocialMediaCard({
  socialMedia,
  onEdit,
}: {
  socialMedia: SelectSocialMedia[];
  onEdit?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="size-4 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">Social Media</h3>
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
      <CardContent className="space-y-2">
        {socialMedia.length === 0 ? (
          <p className="text-sm text-muted-foreground">N/A</p>
        ) : (
          socialMedia.map((social) => (
            <div
              key={social.id}
              className="border-border/60 bg-muted/40 p-2 space-y-2 rounded-md border transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${formatEnumValue(social.platform)} profile of ${social.username}`}
                className="group flex items-center gap-3 "
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <HugeiconsIcon
                    icon={platformIcons[social.platform]}
                    className="size-6"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {social.displayName || social.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {social.username}
                  </p>
                </div>
                <ExternalLink
                  className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </a>
              {social.notes && (
                <p className="p-1 border rounded-md border-dashed">
                  {social.notes}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
