import { getImageProps } from "next/image";

import { formatEnumValue } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

import userPlaceholderImg from "@/public/user_placeholder_img.png";
import { nameInitials } from "@/utils/nameInitials";
import { resolveImagePath } from "@/utils/resolveImagePath";

export interface UserAvatarImageProps extends React.ComponentProps<
  typeof AvatarImage
> {
  image: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
}

export function UserAvatarImage({
  image,
  alt,
  width = 128,
  height = 128,
  ...props
}: UserAvatarImageProps) {
  const {
    props: { src },
  } = getImageProps({
    alt,
    width,
    height,
    src: image ? resolveImagePath(image) : userPlaceholderImg.src,
  });

  return <AvatarImage src={src} {...props} />;
}

interface UserAvatarProps {
  containerClassName?: string;
  className?: string;
  imageUrl?: string | null | undefined;
  userName: string;
  userEmail: string;
  userRoles?: Array<{
    id: string;
    roleName: string;
  }>;
  showRoleDetails?: boolean;
  showDetails?: boolean;
  isActive?: boolean;
}

export function UserAvatar({
  containerClassName,
  className,
  imageUrl,
  userName,
  userEmail,
  userRoles,
  showRoleDetails = false,
  showDetails = false,
  isActive = false,
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 text-left",
        containerClassName
      )}
    >
      <div className="relative">
        <Avatar className={cn("size-8", className)}>
          <UserAvatarImage image={imageUrl} alt={userName} />
          <AvatarFallback className="text-xs font-semibold uppercase">
            {nameInitials(userName)}
          </AvatarFallback>
        </Avatar>
        {isActive && (
          <span className="-inset-e-0.5 absolute -bottom-0.5 size-3 rounded-full border-2 border-background bg-emerald-500">
            <span className="sr-only">Online</span>
          </span>
        )}
      </div>
      {showDetails && (
        <div className="grid flex-1 text-left leading-tight">
          <div className="text-sm font-medium">{userName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {showRoleDetails
              ? userRoles && userRoles?.length > 0
                ? userRoles
                    .map((role) => formatEnumValue(role.roleName))
                    .join(", ")
                : userEmail
              : userEmail}
          </div>
        </div>
      )}
    </div>
  );
}
