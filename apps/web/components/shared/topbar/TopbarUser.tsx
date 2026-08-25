"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BellRing, LogOut, UserRoundCog } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { authClient } from "@/lib/better-auth/auth-client";

import { UserAvatar } from "@/components/UserAvatar";

import { DEFAULT_UNAUTH_PATH } from "@/constants";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

export function TopbarUser() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user!);

  const handleLogout = async () => {
    const toastId = "sign_out_toast_message";

    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          toast.loading("Logging out...", { id: toastId });
        },
        onSuccess: () => {
          toast.success("Logged out successfully", {
            id: toastId,
          });
          router.push(`${DEFAULT_UNAUTH_PATH}?redirect=${pathname}`);
        },
        onError: () => {
          toast.error("Failed to log out. Please try again", {
            id: toastId,
          });
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <UserAvatar
          userEmail={user.email}
          imageUrl={user?.image}
          userName={user.name}
          isActive
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <UserAvatar
              className="px-1 py-1.5"
              userEmail={user.email}
              imageUrl={user?.image}
              userName={user.name}
              showDetails
              isActive
            />
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href={{ pathname: "/dashboard/settings/profile" }} />}
          >
            <UserRoundCog />
            <span>Profile setting</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={{ pathname: "/dashboard/notifications" }} />}
          >
            <BellRing />
            <span>Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
